import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import departmentService from '../../services/departmentService';
import { toast } from 'react-toastify';

const DepartmentForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [headOptions, setHeadOptions] = useState([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  useEffect(() => {
    if (isEdit && id) {
      const fetchDepartment = async () => {
        try {
          const department = await departmentService.getDepartmentById(id);
          // Set form values
          Object.entries(department).forEach(([key, value]) => {
            setValue(key, value);
          });
        } catch (err) {
          console.error('Failed to fetch department:', err);
          toast.error('Failed to load department data');
          navigate('/departments');
        }
      };
      fetchDepartment();
    }
    
    // TODO: Fetch employees for department head selection
    // fetchEmployees();
  }, [id, isEdit, setValue, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit && id) {
        await departmentService.updateDepartment(id, data);
        toast.success('Department updated successfully');
      } else {
        await departmentService.createDepartment(data);
        toast.success('Department created successfully');
      }
      navigate('/departments');
    } catch (err) {
      console.error('Error saving department:', err);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} department`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Department' : 'Add New Department'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Department Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Department name is required' })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.name ? 'border-red-500' : ''
            }`}
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="head" className="block text-sm font-medium text-gray-700">
            Department Head
          </label>
          <select
            id="head"
            {...register('head')}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            disabled={loading || headOptions.length === 0}
          >
            <option value="">Select Department Head</option>
            {headOptions.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name} ({employee.position})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/departments')}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : isEdit ? (
              'Update Department'
            ) : (
              'Create Department'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
