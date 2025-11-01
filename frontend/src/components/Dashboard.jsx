import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import employeeService from '../services/employeeService';
import departmentService from '../services/departmentService';
import leaveService from '../services/leaveService';
import attendanceService from '../services/attendanceService';
import tenantService from '../services/tenantService';
import { showError } from '../utils/toast';
import { FaUsers, FaBuilding, FaCalendarAlt, FaUserClock, FaClipboardList, FaClock, FaHome } from 'react-icons/fa';

const Dashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isDashboard = location.pathname === '/dashboard';
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
    tenantInfo: null,
    recentLeaves: [],
    attendanceTrend: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        // Get current date for attendance check
        const today = new Date().toISOString().split('T')[0];
        
        // Prepare all API calls
        const apiCalls = [
          employeeService.getEmployees().catch(err => {
            console.error('Error fetching employees:', err);
            return { data: [] };
          }),
          departmentService.getAllDepartments().catch(err => {
            console.error('Error fetching departments:', err);
            return { data: [] };
          }),
          leaveService.getTeamLeaves({ status: 'pending' }).catch(err => {
            console.warn('Error fetching pending leaves:', err);
            return { data: [] };
          }),
          // Use getDepartmentAttendance or getTodaysAttendance based on user role
          user.role === 'admin' 
            ? attendanceService.getDepartmentAttendance('all', today).catch(err => {
                console.warn('Error fetching department attendance:', err);
                return { data: { presentCount: 0, totalEmployees: 1 } };
              })
            : attendanceService.getTodaysAttendance(user.id).catch(err => {
                console.warn('Error fetching today\'s attendance:', err);
                return { data: { presentCount: 0, totalEmployees: 1 } };
              })
        ];

        // Add tenant info call for admin users
        if (user.role === 'admin' || user.role === 'super_admin') {
          apiCalls.push(
            tenantService.getTenantInfo().catch(err => {
              console.warn('Error fetching tenant info:', err);
              return { data: null };
            })
          );
        } else {
          apiCalls.push(Promise.resolve({ data: null }));
        }
        
        // Execute all API calls in parallel
        const [
          employeesRes, 
          deptsRes, 
          leavesRes, 
          attendanceRes,
          tenantRes
        ] = await Promise.all(apiCalls);

        // Calculate attendance percentage
        let attendancePercentage = 0;
        const totalEmployees = employeesRes.data?.length || 1; // Avoid division by zero
        const presentCount = attendanceRes.data?.presentCount || 0;
        attendancePercentage = Math.round((presentCount / totalEmployees) * 100);

        // Get recent leaves (last 5)
        const recentLeaves = leavesRes.data?.slice(0, 5) || [];

        setStats({
          totalEmployees: employeesRes.data?.length || 0,
          totalDepartments: deptsRes.data?.length || 0,
          pendingLeaves: leavesRes.data?.length || 0,
          todayAttendance: attendancePercentage,
          tenantInfo: tenantRes?.data || null,
          recentLeaves,
          attendanceTrend: attendanceRes.data?.trend || [],
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showError('Failed to load dashboard data');
        setStats(prev => ({
          ...prev,
          error: 'Failed to load dashboard data. Please try again later.',
          loading: false
        }));
      }
    };

    if (isDashboard) {
      fetchDashboardData();
    }
  }, [isDashboard]);

  const StatCard = ({ icon: Icon, title, value, color, to }) => {
    const content = (
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10 mr-4`}>
          <Icon className={`text-2xl ${color}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
    );

    return to ? (
      <Link to={to} className="block">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          {content}
        </div>
      </Link>
    ) : (
      <div className="bg-white p-6 rounded-lg shadow">
        {content}
      </div>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow h-32 animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow h-64 animate-pulse"></div>
        <div className="bg-white p-6 rounded-lg shadow h-64 animate-pulse"></div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow h-64 animate-pulse"></div>
    </div>
  );

  if (!isDashboard) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500">Welcome back, {user?.name || 'User'}!</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {stats.error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{stats.error}</p>
                </div>
              </div>
            </div>
          ) : stats.loading ? (
            renderLoadingSkeleton()
          ) : (
            <>
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.tenantInfo && (
                  <StatCard
                    icon={FaHome}
                    title="Company"
                    value={stats.tenantInfo?.companyName || 'N/A'}
                    color="text-purple-600"
                    to="/dashboard/settings/company"
                  />
                )}
                <StatCard
                  icon={FaUsers}
                  title="Total Employees"
                  value={stats.totalEmployees}
                  color="text-blue-600"
                  to="/dashboard/employees"
                />
                <StatCard
                  icon={FaBuilding}
                  title="Departments"
                  value={stats.totalDepartments}
                  color="text-green-600"
                  to="/dashboard/departments"
                />
                <StatCard
                  icon={FaClipboardList}
                  title="Leaves Pending"
                  value={stats.pendingLeaves}
                  color="text-yellow-600"
                  to="/dashboard/leaves"
                />
                <StatCard
                  icon={FaUserClock}
                  title="Attendance Today"
                  value={`${stats.todayAttendance}%`}
                  color="text-purple-600"
                  to="/dashboard/attendance"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Leaves */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Recent Leave Requests</h2>
                    <Link to="/dashboard/leaves" className="text-sm text-blue-600 hover:underline">
                      View All
                    </Link>
                  </div>
                  {stats.recentLeaves.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentLeaves.map((leave) => (
                        <div key={leave._id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{leave.employee?.name || 'Employee'}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              leave.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : leave.status === 'rejected' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{leave.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent leave requests</p>
                  )}
                </div>

                {/* Upcoming Holidays */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Upcoming Holidays</h2>
                  </div>
                  <div className="space-y-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg mr-4">
                          <FaCalendarAlt className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Public Holiday {i + 1}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link
                      to="/dashboard/leaves/apply"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <FaClipboardList className="text-blue-600 mr-3" />
                      <span>Apply for Leave</span>
                    </Link>
                    <Link
                      to="/dashboard/attendance"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <FaUserClock className="text-green-600 mr-3" />
                      <span>Mark Attendance</span>
                    </Link>
                    <Link
                      to="/dashboard/employees/new"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <FaUsers className="text-purple-600 mr-3" />
                      <span>Add New Employee</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Attendance Trend */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Attendance Trend (Last 7 Days)</h2>
                  <Link to="/dashboard/attendance" className="text-sm text-blue-600 hover:underline">
                    View Details
                  </Link>
                </div>
                <div className="h-64 flex items-end space-x-2">
                  {stats.attendanceTrend.length > 0 ? (
                    stats.attendanceTrend.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-100 rounded-t hover:bg-blue-200 transition-colors relative group"
                          style={{ height: `${day.percentage}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {day.percentage}%
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No attendance data available
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;