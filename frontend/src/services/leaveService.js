import api from './api';

const leaveService = {
  // Apply for leave
  async applyLeave(leaveData) {
    try {
      const response = await api.post('/leaves', leaveData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Apply leave error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to apply for leave' 
      };
    }
  },

  // Get employee's leave applications
  async getMyLeaves(filters = {}) {
    try {
      const response = await api.get('/leaves/my-leaves', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get leaves error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch leave applications' 
      };
    }
  },

  // Get leave by ID
  async getLeaveById(leaveId) {
    try {
      const response = await api.get(`/leaves/${leaveId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get leave error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch leave details' 
      };
    }
  },

  // Update leave status (for managers/admins)
  async updateLeaveStatus(leaveId, statusData) {
    try {
      const response = await api.patch(`/leaves/${leaveId}/status`, statusData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update leave status error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update leave status' 
      };
    }
  },

  // Cancel leave application
  async cancelLeave(leaveId) {
    try {
      const response = await api.patch(`/leaves/${leaveId}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Cancel leave error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to cancel leave' 
      };
    }
  },

  // Get leave statistics
  async getLeaveStats() {
    try {
      const response = await api.get('/leaves/stats');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get leave stats error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch leave statistics' 
      };
    }
  },

  // Get team leaves (for managers/admins)
  async getTeamLeaves(filters = {}) {
    try {
      const response = await api.get('/leaves/team', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get team leaves error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch team leaves' 
      };
    }
  }
};

export default leaveService;
