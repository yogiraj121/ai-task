import api from './api';

const tenantService = {
  /**
   * Get current tenant information
   * @returns {Promise<Object>} Tenant information
   */
  getTenantInfo: async () => {
    try {
      // In a real app, this would be an API call to get the current tenant info
      // For now, we'll return mock data
      return {
        data: {
          companyName: 'Acme Inc.',
          domain: 'acme.hrms.com',
          contactEmail: 'admin@acme.com',
          subscription: {
            plan: 'premium',
            status: 'active',
            trialEnds: null
          },
          settings: {
            timezone: 'UTC+05:30',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '12h'
          }
        }
      };
      
      // Uncomment this in production:
      // const response = await api.get('/api/tenant/info');
      // return response.data;
    } catch (error) {
      console.error('Error fetching tenant info:', error);
      throw error;
    }
  },

  /**
   * Update tenant information
   * @param {Object} data - Updated tenant data
   * @returns {Promise<Object>} Updated tenant information
   */
  updateTenantInfo: async (data) => {
    try {
      // In a real app, this would be an API call to update the tenant info
      // For now, we'll just return the data as if it was updated
      return {
        data: {
          ...data,
          updatedAt: new Date().toISOString()
        }
      };
      
      // Uncomment this in production:
      // const response = await api.put('/api/tenant/info', data);
      // return response.data;
    } catch (error) {
      console.error('Error updating tenant info:', error);
      throw error;
    }
  },

  /**
   * Get subscription details
   * @returns {Promise<Object>} Subscription details
   */
  getSubscription: async () => {
    try {
      // Mock data - replace with actual API call in production
      return {
        data: {
          plan: 'premium',
          status: 'active',
          trialEnds: null,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          maxEmployees: 100,
          features: [
            'Unlimited Departments',
            'Advanced Analytics',
            'Priority Support',
            'API Access'
          ]
        }
      };
      
      // Uncomment this in production:
      // const response = await api.get('/api/tenant/subscription');
      // return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  },

  /**
   * Update subscription plan
   * @param {string} plan - New plan name
   * @returns {Promise<Object>} Updated subscription details
   */
  updateSubscription: async (plan) => {
    try {
      // Mock data - replace with actual API call in production
      return {
        data: {
          plan,
          status: 'active',
          updatedAt: new Date().toISOString()
        }
      };
      
      // Uncomment this in production:
      // const response = await api.put('/api/tenant/subscription', { plan });
      // return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
};

export default tenantService;
