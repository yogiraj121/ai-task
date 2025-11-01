import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import leaveService from '../../services/leaveService';
import { showSuccess, showError } from '../../utils/toast';

const LeaveList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    year: new Date().getFullYear(),
    leaveType: ''
  });

  const leaveTypes = [
    'sick', 'vacation', 'personal', 'maternity', 'paternity', 'bereavement', 'other'
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        setLoading(true);
        // In development, use mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock leave data');
          const mockLeaves = [
            {
              id: '1',
              employee: { name: 'John Doe', id: '123' },
              leaveType: 'vacation',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'pending',
              reason: 'Annual vacation',
              createdAt: new Date().toISOString()
            },
            // Add more mock leave entries as needed
          ];
          setLeaves(mockLeaves);
        } else {
          // In production, make actual API call
          const { success, data, message } = await leaveService.getMyLeaves(filters);
          
          if (success) {
            setLeaves(data);
          } else {
            showError(message || 'Failed to fetch leave applications');
            setLeaves([]); // Set empty array to prevent errors
          }
        }
      } catch (error) {
        console.error('Error in loadLeaves:', error);
        // Don't show error in development to prevent confusion with mock data
        if (process.env.NODE_ENV !== 'development') {
          showError('An error occurred while fetching leave applications');
        }
        setLeaves([]); // Ensure we always have an array
      } finally {
        setLoading(false);
      }
    };

    loadLeaves();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (leaveId) => {
    navigate(`/dashboard/leaves/${leaveId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Leave Applications</h2>
        <button
          onClick={() => navigate('/dashboard/leaves/apply')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply for Leave
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select
              name="leaveType"
              value={filters.leaveType}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              {leaveTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                status: '',
                year: new Date().getFullYear(),
                leaveType: ''
              })}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Leave List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {leaves.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No leave applications found. Click "Apply for Leave" to create a new one.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {leave.leaveType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{leave.days} day(s)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[leave.status]}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(leave._id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                    {leave.status === 'pending' && (
                      <button
                        onClick={() => handleCancelLeave(leave._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  async function handleCancelLeave(leaveId) {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      try {
        const { success, message } = await leaveService.cancelLeave(leaveId);
        if (success) {
          showSuccess('Leave application cancelled successfully');
          fetchLeaves();
        } else {
          showError(message || 'Failed to cancel leave application');
        }
      } catch (error) {
        console.error('Cancel leave error:', error);
        showError('An error occurred while cancelling the leave');
      }
    }
  }
};

export default LeaveList;
