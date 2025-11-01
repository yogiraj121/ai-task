import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import departmentService from '../../services/departmentService';
import { toast } from 'react-toastify';
import { showLoading, dismissToast } from '../../utils/toast';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getAllDepartments();
        // Handle the response structure from our mock service
        const departmentsData = response.docs || [];
        setDepartments(departmentsData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        setError('Failed to load departments. Please try again later.');
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentService.deleteDepartment(id);
        // Update the departments list after deletion
        const response = await departmentService.getAllDepartments();
        setDepartments(response.docs || []);
        toast.success('Department deleted successfully');
      } catch (err) {
        console.error('Failed to delete department:', err);
        toast.error('Failed to delete department');
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading departments...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Departments</h2>
        <button
          onClick={(e) => {
            e.preventDefault();
            const toastId = showLoading('Loading department form...');
            setIsNavigating(true);
            // Small delay to allow loading state to show
            setTimeout(() => {
              navigate('/dashboard/departments/new');
              dismissToast(toastId);
              setIsNavigating(false);
            }, 300);
          }}
          disabled={isNavigating}
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
            isNavigating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isNavigating ? 'Loading...' : 'Add Department'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Head
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employees
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.length > 0 ? (
              departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {dept.name}
                      </div>
                      {dept.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {dept.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {dept.manager || 'Not assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.manager || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.employees ? dept.employees.length : 0} employees
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/dashboard/departments/${dept.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    <Link
                      to={{
                        pathname: `/dashboard/departments/${dept.id}/edit`,
                        state: { department: dept }
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No departments found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentList;
