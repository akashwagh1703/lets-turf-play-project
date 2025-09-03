import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import StaffDashboard from '../pages/StaffDashboard';
import StaffBookingManagement from '../components/StaffBookingManagement';
import ProfileSettings from '../components/ProfileSettings';
import SystemSettings from '../components/SystemSettings';

const StaffLayout = () => {
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname.split('/')[2];
    switch (path) {
      case 'bookings': return 'bookings';
      default: return 'dashboard';
    }
  };

  return (
    <Layout activeTab={getActiveTab()}>
      <Routes>
        <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/dashboard" element={<StaffDashboard />} />
        <Route path="/bookings" element={<StaffBookingManagement />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </Layout>
  );
};

export default StaffLayout;