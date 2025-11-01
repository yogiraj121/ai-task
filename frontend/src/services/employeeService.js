import api from './api';

// Mock data for development
const mockEmployees = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    department: 'IT',
    position: 'Software Developer',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    department: 'HR',
    position: 'HR Manager',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    department: 'Finance',
    position: 'Accountant',
    status: 'active'
  }
];

const employeeService = {
  // Get all employees with optional filters and pagination
  getEmployees: async (params = {}) => {
    console.log('Fetching employees with params:', params);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, return mock data
    return {
      docs: mockEmployees,
      page: 1,
      limit: 10,
      total: mockEmployees.length,
      totalPages: 1
    };
  },

  // Get single employee by ID
  getEmployeeById: async (id) => {
    console.log('Fetching employee with ID:', id);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find employee in mock data
    const employee = mockEmployees.find(emp => emp.id === id);
    
    if (!employee) {
      const error = new Error('Employee not found');
      error.response = { status: 404 };
      throw error;
    }
    
    return employee;
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      console.log('Creating employee with data:', employeeData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a new ID
      const newId = (mockEmployees.length + 1).toString();
      
      // Create new employee object
      const newEmployee = {
        id: newId,
        ...employeeData,
        status: employeeData.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to mock data
      mockEmployees.push(newEmployee);
      
      console.log('New employee created:', newEmployee);
      return newEmployee;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      await api.delete(`/employees/${id}`);
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  },

  // Get employees by department
  getEmployeesByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/employees?department=${departmentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employees for department ${departmentId}:`, error);
      throw error;
    }
  },

  // Get managers
  getManagers: async () => {
    try {
      const response = await api.get('/employees?role=manager');
      return response.data;
    } catch (error) {
      console.error('Error fetching managers:', error);
      throw error;
    }
  },

  // Upload employee document
  uploadDocument: async (employeeId, formData) => {
    try {
      const response = await api.post(`/employees/${employeeId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error uploading document for employee ${employeeId}:`, error);
      throw error;
    }
  },

  // Delete employee document
  deleteDocument: async (employeeId, documentId) => {
    try {
      await api.delete(`/employees/${employeeId}/documents/${documentId}`);
    } catch (error) {
      console.error(`Error deleting document ${documentId} for employee ${employeeId}:`, error);
      throw error;
    }
  }
};

export default employeeService;
