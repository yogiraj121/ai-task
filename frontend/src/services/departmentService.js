// Mock data for departments
let mockDepartments = [
  {
    id: '1',
    name: 'Information Technology',
    code: 'IT',
    manager: 'John Doe',
    description: 'Handles all IT-related operations',
    status: 'active'
  },
  {
    id: '2',
    name: 'Human Resources',
    code: 'HR',
    manager: 'Jane Smith',
    description: 'Manages employee relations and recruitment',
    status: 'active'
  },
  {
    id: '3',
    name: 'Finance',
    code: 'FIN',
    manager: 'Robert Johnson',
    description: 'Handles financial operations and accounting',
    status: 'active'
  }
];

// Generate a simple unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

const departmentService = {
  // Get all departments
  getAllDepartments: async () => {
    console.log('Fetching departments (mock data)');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      docs: [...mockDepartments],
      page: 1,
      limit: 10,
      total: mockDepartments.length,
      totalPages: 1
    };
  },

  // Get single department by ID
  getDepartmentById: async (id) => {
    console.log(`Fetching department ${id} (mock data)`);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const department = mockDepartments.find(dept => dept.id === id);
    if (!department) {
      const error = new Error('Department not found');
      error.response = { status: 404 };
      throw error;
    }
    return { ...department }; // Return a copy to avoid direct mutation
  },

  // Create new department
  createDepartment: async (departmentData) => {
    console.log('Creating department (mock data):', departmentData);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDepartment = {
      id: generateId(),
      ...departmentData,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    mockDepartments.push(newDepartment);
    return newDepartment;
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    console.log(`Updating department ${id} (mock data):`, departmentData);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockDepartments.findIndex(dept => dept.id === id);
    if (index === -1) {
      const error = new Error('Department not found');
      error.response = { status: 404 };
      throw error;
    }
    
    mockDepartments[index] = { ...mockDepartments[index], ...departmentData };
    return { ...mockDepartments[index] };
  },

  // Delete department
  deleteDepartment: async (id) => {
    console.log(`Deleting department ${id} (mock data)`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const initialLength = mockDepartments.length;
    mockDepartments = mockDepartments.filter(dept => dept.id !== id);
    
    if (mockDepartments.length === initialLength) {
      const error = new Error('Department not found');
      error.response = { status: 404 };
      throw error;
    }
  },

  // Get department employees (mock implementation)
  getDepartmentEmployees: async (departmentId) => {
    console.log(`Fetching employees for department ${departmentId} (mock data)`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock employee data
    return {
      data: [
        { id: 'e1', name: 'John Smith', position: 'Developer' },
        { id: 'e2', name: 'Jane Doe', position: 'Designer' }
      ]
    };
  }
};

export default departmentService;
