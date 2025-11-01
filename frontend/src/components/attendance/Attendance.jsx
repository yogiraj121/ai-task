import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/toast';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null, error: null });

  useEffect(() => {
    fetchTodaysAttendance();
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            error: null
          });
        },
        (error) => {
          setLocation({
            lat: null,
            lng: null,
            error: 'Unable to retrieve your location. Please enable location services.'
          });
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setLocation({
        lat: null,
        lng: null,
        error: 'Geolocation is not supported by your browser.'
      });
    }
  };

  const fetchTodaysAttendance = async () => {
    try {
      setLoading(true);
      const { success, data, message } = await attendanceService.getTodaysAttendance(user._id);
      
      if (success) {
        setAttendance(data);
      } else {
        showError(message || 'Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const toastId = showLoading('Checking in...');
      
      const checkInData = {
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
          address: 'Office Location' // You might want to implement reverse geocoding here
        },
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      };

      const { success, data, message } = await attendanceService.checkIn(user._id, checkInData);
      
      if (success) {
        setAttendance(data);
        showSuccess('Successfully checked in!');
      } else {
        showError(message || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      showError('Failed to check in');
    } finally {
      setCheckingIn(false);
      dismissToast();
    }
  };

  const handleCheckOut = async () => {
    try {
      if (!attendance?._id) return;
      
      setCheckingOut(true);
      const toastId = showLoading('Checking out...');
      
      const checkOutData = {
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
          address: 'Office Location' // You might want to implement reverse geocoding here
        }
      };

      const { success, data, message } = await attendanceService.checkOut(attendance._id, checkOutData);
      
      if (success) {
        setAttendance(data);
        showSuccess('Successfully checked out!');
      } else {
        showError(message || 'Failed to check out');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      showError('Failed to check out');
    } finally {
      setCheckingOut(false);
      dismissToast();
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Attendance</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Today's Attendance</h3>
            <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Status</div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              attendance?.status === 'present' ? 'bg-green-100 text-green-800' :
              attendance?.status === 'absent' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {attendance?.status || 'Not checked in'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-3 rounded border">
            <div className="text-sm text-gray-500">Check In</div>
            <div className="text-xl font-semibold">
              {attendance?.checkIn ? formatTime(attendance.checkIn) : '--:--'}
              {attendance?.isLate && (
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                  Late
                </span>
              )}
            </div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-sm text-gray-500">Check Out</div>
            <div className="text-xl font-semibold">
              {attendance?.checkOut ? formatTime(attendance.checkOut) : '--:--'}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-1">Working Hours</div>
          <div className="text-lg font-medium">
            {attendance?.workingHours ? `${attendance.workingHours} hours` : '--:--'}
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        {!attendance?.checkIn ? (
          <button
            onClick={handleCheckIn}
            disabled={checkingIn || location.error}
            className={`flex-1 py-3 px-4 rounded-md font-medium text-white ${
              location.error || checkingIn
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {checkingIn ? 'Checking In...' : 'Check In'}
          </button>
        ) : !attendance?.checkOut ? (
          <button
            onClick={handleCheckOut}
            disabled={checkingOut}
            className={`flex-1 py-3 px-4 rounded-md font-medium text-white ${
              checkingOut ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {checkingOut ? 'Checking Out...' : 'Check Out'}
          </button>
        ) : (
          <div className="w-full py-3 text-center text-green-700 bg-green-100 rounded-md">
            You've completed today's attendance
          </div>
        )}
      </div>

      {location.error && (
        <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {location.error} Attendance may not be recorded accurately.
        </div>
      )}
    </div>
  );
};

export default Attendance;
