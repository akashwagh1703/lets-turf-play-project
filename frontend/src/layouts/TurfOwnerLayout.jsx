import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import TurfOwnerDashboard from '../pages/TurfOwnerDashboard';
import TurfForm from '../components/TurfForm';
import MyTurfs from '../components/MyTurfs';
import BookingManagement from '../components/BookingManagement';
import StaffManagement from '../components/StaffManagement';
import AdvancedAnalytics from '../pages/AdvancedAnalytics';
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
      case 'analytics': return 'analytics';
      case 'profile': return 'profile';
      case 'settings': return 'settings';
      default: return 'dashboard';
    }
  };

  return (
    <Layout activeTab={getActiveTab()}>
      <Routes>
        <Route path="/" element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="/dashboard" element={<TurfOwnerDashboard />} />
        <Route path="/turfs" element={<MyTurfs />} />
        <Route path="/turfs/add" element={<TurfForm />} />
        <Route path="/turfs/edit/:id" element={<TurfForm />} />
        <Route path="/turfs/view/:id" element={<TurfForm />} />
        <Route path="/bookings" element={<BookingManagement />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/analytics" element={<AdvancedAnalytics />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </Layout>
  );
};

export default TurfOwnerLayout;