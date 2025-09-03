import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import TurfOwnerDashboard from '../pages/TurfOwnerDashboard';
import TurfManagement from '../components/TurfManagement';
import BookingManagement from '../components/BookingManagement';
import StaffManagement from '../components/StaffManagement';
import TurfOwnerSubscription from '../components/TurfOwnerSubscription';
import ProfileSettings from '../components/ProfileSettings';
import SystemSettings from '../components/SystemSettings';

const TurfOwnerLayout = () => {
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname.split('/')[2];
    switch (path) {
      case 'turfs': return 'turfs';
      case 'bookings': return 'bookings';
      case 'staff': return 'staff';
      case 'subscription': return 'subscription';
      default: return 'dashboard';
    }
  };

  return (
    <Layout activeTab={getActiveTab()}>
      <Routes>
        <Route path="/" element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="/dashboard" element={<TurfOwnerDashboard />} />
        <Route path="/turfs" element={<TurfManagement />} />
        <Route path="/bookings" element={<BookingManagement />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/subscription" element={<TurfOwnerSubscription />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </Layout>
  );
};

export default TurfOwnerLayout;