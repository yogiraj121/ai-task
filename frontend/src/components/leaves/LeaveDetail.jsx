import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import leaveService from '../../services/leaveService';
import { showSuccess, showError } from '../../utils/toast';

const LeaveDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  const isManagerOrAdmin = ['admin', 'hr', 'manager'].includes(user.role);
  const isLeaveOwner = leave && leave.employee._id === user._id;

  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        setLoading(true);
        const { success, data } = await leaveService.getLeaveById(id);
        
        if (success) {
          setLeave(data);
          if (data.rejectionReason) {
            setRejectionReason(data.rejectionReason);
          }
        } else {
          showError('Failed to load leave details');
          navigate('/dashboard/leaves');
        }
      } catch (error) {
        console.error('Error fetching leave details:', error);
        showError('An error occurred while loading leave details');
        navigate('/dashboard/leaves');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveDetails();
  }, [id, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleStatusUpdate = async (status) => {
    if (status === 'rejected' && !rejectionReason) {
      setShowRejectionInput(true);
      return;
    }

    try {
      setUpdatingStatus(true);
      const response = await leaveService.updateLeaveStatus(id, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined
      });

      if (response.success) {
        setLeave(prev => ({
          ...prev,
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : prev.rejectionReason,
          approvedBy: status !== 'pending' ? user._id : undefined,
          approvedAt: status !== 'pending' ? new Date() : undefined
        }));
        
        showSuccess(`Leave application ${status} successfully`);
        setShowRejectionInput(false);
      } else {
        showError(response.message || 'Failed to update leave status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      showError('An error occurred while updating the leave status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelLeave = async () => {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      try {
        const { success, message } = await leaveService.cancelLeave(id);
        if (success) {
          setLeave(prev => ({
            ...prev,
            status: 'cancelled'
          }));
          showSuccess('Leave application cancelled successfully');
        } else {
          showError(message || 'Failed to cancel leave application');
        }
      } catch (error) {
        console.error('Cancel leave error:', error);
        showError('An error occurred while cancelling the leave');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="p-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Leave application not found.</p>
          <button
            onClick={() => navigate('/dashboard/leaves')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to My Leaves
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Leave Application</h2>
            <p className="text-gray-500">
              {leave.employee.name} • {formatDate(leave.createdAt)}
            </p>
          </div>
          <div>
            {getStatusBadge(leave.status)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Leave Type</h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">{leave.leaveType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                </p>
                <p className="text-sm text-gray-500">{leave.days} day(s)</p>
              </div>
              {leave.isHalfDay && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Half Day</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {leave.halfDayType === 'first' ? 'First Half' : 'Second Half'}
                  </p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Application Date</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(leave.createdAt)}
                </p>
              </div>
              {leave.approvedBy && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {leave.status === 'approved' ? 'Approved' : 'Rejected'} By
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {leave.approvedBy?.name || 'System'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(leave.approvedAt)}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500">Reason</h3>
              <p className="mt-2 text-sm text-gray-900 whitespace-pre-line">
                {leave.reason || 'No reason provided.'}
              </p>
            </div>

            {leave.contactInfo && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Contact During Leave</h3>
                <p className="mt-1 text-sm text-gray-900">{leave.contactInfo}</p>
              </div>
            )}

            {leave.rejectionReason && (
              <div className="mt-6 p-4 bg-red-50 rounded-md">
                <h3 className="text-sm font-medium text-red-800">Rejection Reason</h3>
                <p className="mt-1 text-sm text-red-700">{leave.rejectionReason}</p>
              </div>
            )}

            {showRejectionInput && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Please provide a reason for rejecting this leave application"
                />
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={!rejectionReason || updatingStatus}
                    className={`px-4 py-2 rounded-md text-white ${
                      !rejectionReason || updatingStatus
                        ? 'bg-red-300 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {updatingStatus ? 'Submitting...' : 'Confirm Rejection'}
                  </button>
                  <button
                    onClick={() => setShowRejectionInput(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => navigate('/dashboard/leaves')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to List
            </button>

            <div className="space-x-2">
              {isLeaveOwner && leave.status === 'pending' && (
                <button
                  onClick={handleCancelLeave}
                  disabled={updatingStatus}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel Leave
                </button>
              )}

              {isManagerOrAdmin && leave.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={updatingStatus}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={updatingStatus}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}

              {isLeaveOwner && leave.status === 'pending' && (
                <button
                  onClick={() => navigate(`/dashboard/leaves/${leave._id}/edit`)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetail;
