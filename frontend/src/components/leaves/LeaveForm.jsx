import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import leaveService from '../../services/leaveService';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/toast';

const LeaveForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState({
    vacation: 20,
    sick: 10,
    personal: 5
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      leaveType: 'vacation',
      startDate: '',
      endDate: '',
      days: 1,
      reason: '',
      contactInfo: '',
      isHalfDay: false,
      halfDayType: 'first'
    }
  });

  const watchLeaveType = watch('leaveType');
  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');
  const watchIsHalfDay = watch('isHalfDay');

  // Calculate days when dates change
  useEffect(() => {
    if (watchStartDate && watchEndDate) {
      const start = new Date(watchStartDate);
      const end = new Date(watchEndDate);
      
      // Reset time part
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      // Calculate difference in days
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      
      setValue('days', diffDays);
    }
  }, [watchStartDate, watchEndDate, setValue]);

  // Load leave data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const loadLeaveData = async () => {
        try {
          setLoading(true);
          const { success, data } = await leaveService.getLeaveById(id);
          
          if (success) {
            // Format dates for date inputs (YYYY-MM-DD)
            const formattedData = {
              ...data,
              startDate: data.startDate.split('T')[0],
              endDate: data.endDate.split('T')[0]
            };
            
            // Set form values
            Object.entries(formattedData).forEach(([key, value]) => {
              setValue(key, value);
            });
          } else {
            showError('Failed to load leave details');
            navigate('/dashboard/leaves');
          }
        } catch (error) {
          console.error('Error loading leave:', error);
          showError('An error occurred while loading leave details');
          navigate('/dashboard/leaves');
        } finally {
          setLoading(false);
        }
      };
      
      loadLeaveData();
    }
  }, [isEdit, id, setValue, navigate]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const toastId = showLoading(isEdit ? 'Updating leave...' : 'Submitting leave application...');
      
      // Convert dates to proper format
      const leaveData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        days: parseFloat(data.days)
      };

      let response;
      if (isEdit && id) {
        response = await leaveService.updateLeave(id, leaveData);
      } else {
        response = await leaveService.applyLeave(leaveData);
      }

      dismissToast(toastId);
      
      if (response.success) {
        showSuccess(isEdit ? 'Leave updated successfully' : 'Leave application submitted successfully');
        navigate('/dashboard/leaves');
      } else {
        showError(response.message || (isEdit ? 'Failed to update leave' : 'Failed to submit leave application'));
      }
    } catch (error) {
      console.error('Submit leave error:', error);
      showError('An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'bereavement', label: 'Bereavement Leave' },
    { value: 'other', label: 'Other' }
  ];

  const renderLeaveBalance = () => {
    if (!leaveBalance) return null;
    
    return (
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Your Leave Balance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Vacation</div>
            <div className="text-xl font-bold">
              {leaveBalance.vacation} days
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Sick Leave</div>
            <div className="text-xl font-bold">
              {leaveBalance.sick} days
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Personal</div>
            <div className="text-xl font-bold">
              {leaveBalance.personal} days
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          {isEdit ? 'Edit Leave Application' : 'Apply for Leave'}
        </h2>
        
        {!isEdit && renderLeaveBalance()}
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leave Type */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('leaveType', { required: 'Leave type is required' })}
                className={`w-full p-2 border rounded-md ${
                  errors.leaveType ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading || isEdit}
              >
                {leaveTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.leaveType && (
                <p className="mt-1 text-sm text-red-600">{errors.leaveType.message}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-2 border rounded-md ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('endDate', { 
                  required: 'End date is required',
                  validate: value => {
                    if (!watchStartDate) return true;
                    return new Date(value) >= new Date(watchStartDate) || 'End date must be after start date';
                  }
                })}
                min={watchStartDate || new Date().toISOString().split('T')[0]}
                className={`w-full p-2 border rounded-md ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!watchStartDate || loading}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>

            {/* Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Days
              </label>
              <input
                type="number"
                {...register('days', { 
                  required: 'Number of days is required',
                  min: { value: 0.5, message: 'Minimum 0.5 days' },
                  max: { value: 90, message: 'Maximum 90 days' }
                })}
                min="0.5"
                step="0.5"
                className={`w-full p-2 border rounded-md ${
                  errors.days ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={true}
              />
              {errors.days && (
                <p className="mt-1 text-sm text-red-600">{errors.days.message}</p>
              )}
            </div>

            {/* Half Day Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isHalfDay"
                {...register('isHalfDay')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="isHalfDay" className="ml-2 block text-sm text-gray-700">
                Half Day
              </label>
            </div>

            {/* Half Day Type */}
            {watchIsHalfDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Half Day Type
                </label>
                <select
                  {...register('halfDayType')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={loading}
                >
                  <option value="first">First Half</option>
                  <option value="second">Second Half</option>
                </select>
              </div>
            )}

            {/* Contact Information */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Information During Leave <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('contactInfo', { 
                  required: 'Contact information is required',
                  minLength: { value: 5, message: 'Please provide valid contact information' }
                })}
                placeholder="Phone number or email"
                className={`w-full p-2 border rounded-md ${
                  errors.contactInfo ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.contactInfo && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
              )}
            </div>

            {/* Reason */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Leave <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('reason', { 
                  required: 'Reason is required',
                  minLength: { value: 10, message: 'Please provide a detailed reason' }
                })}
                rows={4}
                placeholder="Please provide details about your leave request"
                className={`w-full p-2 border rounded-md ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/leaves')}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : isEdit ? 'Update Leave' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveForm;
