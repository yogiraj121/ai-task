import api from './api';

const attendanceService = {
  // Check in
  async checkIn(employeeId, data) {
    try {
      const response = await api.post('/attendance/check-in', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Check-in error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to check in' 
      };
    }
  },

  // Check out
  async checkOut(attendanceId, data) {
    try {
      const response = await api.put(`/attendance/${attendanceId}/check-out`, data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Check-out error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to check out' 
      };
    }
  },

  // Get today's attendance
  async getTodaysAttendance(employeeId) {
    try {
      const response = await api.get(`/attendance/today/${employeeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get attendance error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch attendance' 
      };
    }
  },

  // Get attendance summary
  async getAttendanceSummary(employeeId, startDate, endDate) {
    try {
      const response = await api.get(`/attendance/summary/${employeeId}`, {
        params: { startDate, endDate }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get attendance summary error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch attendance summary' 
      };
    }
  },

  // Get department attendance
  async getDepartmentAttendance(departmentId, date) {
    try {
      const response = await api.get(`/attendance/department/${departmentId}`, {
        params: { date }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get department attendance error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch department attendance' 
      };
    }
  }
};

export default attendanceService;
