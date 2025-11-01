import React from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Step1 from "./components/onboard/Step1";
import Step2 from "./components/onboard/Step2";
import Step3 from "./components/onboard/Step3";

// Department Components
import DepartmentList from "./components/departments/DepartmentList";
import DepartmentForm from "./components/departments/DepartmentForm";
import DepartmentDetail from "./components/departments/DepartmentDetail";

// Employee Components
import EmployeeList from "./components/employees/EmployeeList";
import EmployeeDetail from "./components/employees/EmployeeDetail";
import AddEmployee from "./components/employees/AddEmployee";
import Attendance from "./components/attendance/Attendance";

// Leave Components
import LeaveList from "./components/leaves/LeaveList";
import LeaveForm from "./components/leaves/LeaveForm";
import LeaveDetail from "./components/leaves/LeaveDetail";

// Settings Components
import CompanySettings from "./components/settings/CompanySettings";

// Custom route components
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

const App = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<div>Dashboard Home</div>} />
            <Route path="departments" element={<DepartmentList />} />
            <Route path="departments/new" element={<DepartmentForm />} />
            <Route path="departments/:id" element={<DepartmentDetail />} />
            <Route path="departments/:id/edit" element={<DepartmentForm isEdit={true} />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/add" element={<AddEmployee />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
            <Route path="attendance" element={<Attendance />} />
            
            {/* Leave Management Routes */}
            <Route path="leaves" element={<LeaveList />} />
            <Route path="leaves/apply" element={<LeaveForm />} />
            <Route path="leaves/:id" element={<LeaveDetail />} />
            <Route path="leaves/:id/edit" element={<LeaveForm isEdit={true} />} />
            
            {/* Settings Routes */}
            <Route path="settings/company" element={<CompanySettings />} />
          </Route>
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>  
  );
};

export default App;
