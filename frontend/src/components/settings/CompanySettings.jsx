import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import tenantService from '../../services/tenantService';
import { showSuccess, showError } from '../../utils/toast';
import { FaBuilding, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaSave, FaSpinner, FaTimes } from 'react-icons/fa';

const CompanySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const response = await tenantService.getTenantInfo();
        setCompany(response.data);
        reset(response.data);
      } catch (error) {
        console.error('Error fetching company data:', error);
        showError('Failed to load company information');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      // In a real app, we would call the API to update the company info
      // const response = await tenantService.updateTenantInfo(data);
      // setCompany(response.data);
      
      // For now, just update the local state
      setCompany(prev => ({
        ...prev,
        ...data,
        updatedAt: new Date().toISOString()
      }));
      
      showSuccess('Company information updated successfully');
    } catch (error) {
      console.error('Error updating company:', error);
      showError('Failed to update company information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800">Company Settings</h2>
        <p className="text-gray-600 mt-1">Manage your company information and preferences</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-200">
        <div className="px-6 py-5 space-y-6">
          {/* Company Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FaBuilding className="mr-2 text-blue-600" />
              Company Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Update your company details that will be used across the platform.
            </p>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.companyName ? 'border-red-300' : ''
                    }`}
                    {...register('companyName', { required: 'Company name is required' })}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                  Domain
                </label>
                <div className="mt-1">
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      id="domain"
                      name="domain"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                      placeholder="yourcompany"
                      {...register('domain')}
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      .hrms.com
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Contact Email *
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    <FaEnvelope className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 ${
                      errors.contactEmail ? 'border-red-300' : ''
                    }`}
                    {...register('contactEmail', {
                      required: 'Contact email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                </div>
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('contactPhone')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Address */}
          <div className="pt-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-green-600" />
              Company Address
            </h3>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('address.street')}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('address.city')}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('address.state')}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                  ZIP / Postal Code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="address.postalCode"
                    name="address.postalCode"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('address.postalCode')}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <div className="mt-1">
                  <select
                    id="address.country"
                    name="address.country"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('address.country')}
                  >
                    <option value="">Select a country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    {/* Add more countries as needed */}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Company Settings */}
          <div className="pt-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FaCog className="mr-2 text-purple-600" />
              Company Settings
            </h3>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="settings.timezone" className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <div className="mt-1">
                  <select
                    id="settings.timezone"
                    name="settings.timezone"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('settings.timezone')}
                  >
                    <option value="UTC+00:00">UTC+00:00 (GMT) Greenwich Mean Time</option>
                    <option value="UTC+05:30">UTC+05:30 (IST) India Standard Time</option>
                    <option value="UTC-05:00">UTC-05:00 (EST) Eastern Time</option>
                    <option value="UTC-08:00">UTC-08:00 (PST) Pacific Time</option>
                    <option value="UTC+01:00">UTC+01:00 (CET) Central European Time</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="settings.dateFormat" className="block text-sm font-medium text-gray-700">
                  Date Format
                </label>
                <div className="mt-1">
                  <select
                    id="settings.dateFormat"
                    name="settings.dateFormat"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('settings.dateFormat')}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</option>
                    <option value="MMM D, YYYY">MMM D, YYYY (Dec 31, 2023)</option>
                    <option value="MMMM D, YYYY">MMMM D, YYYY (December 31, 2023)</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="settings.timeFormat" className="block text-sm font-medium text-gray-700">
                  Time Format
                </label>
                <div className="mt-1">
                  <select
                    id="settings.timeFormat"
                    name="settings.timeFormat"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('settings.timeFormat')}
                  >
                    <option value="12h">12-hour (2:30 PM)</option>
                    <option value="24h">24-hour (14:30)</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="settings.weekStart" className="block text-sm font-medium text-gray-700">
                  First Day of Week
                </label>
                <div className="mt-1">
                  <select
                    id="settings.weekStart"
                    name="settings.weekStart"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('settings.weekStart', { valueAsNumber: true })}
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 text-right">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            onClick={() => reset()}
          >
            <FaTimes className="inline mr-1" /> Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={saving}
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="-ml-1 mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
