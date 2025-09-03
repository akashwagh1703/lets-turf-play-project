import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import TurfOwnerManagement from '../components/TurfOwnerManagement';
import SuperAdminTurfManagement from '../components/SuperAdminTurfManagement';
import SuperAdminStaffManagement from '../components/SuperAdminStaffManagement';
import RevenueModelManagement from '../components/RevenueModelManagement';
import PlayerManagement from '../components/PlayerManagement';
import SubscriptionListing from '../components/SubscriptionListing';
import ProfileSettings from '../components/ProfileSettings';
import SystemSettings from '../components/SystemSettings';

const SuperAdminLayout = () => {
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname.split('/')[2];
    switch (path) {
      case 'owners': return 'owners';
      case 'turfs': return 'turfs';
      case 'staff': return 'staff';
      case 'subscription': return 'subscription';
      case 'revenue': return 'revenue';
      case 'players': return 'players';
      default: return 'dashboard';
    }
  };

  return (
    <Layout activeTab={getActiveTab()}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/owners" element={<TurfOwnerManagement />} />
        <Route path="/turfs" element={<SuperAdminTurfManagement />} />
        <Route path="/staff" element={<SuperAdminStaffManagement />} />
        <Route path="/subscription" element={<SubscriptionListing />} />
        <Route path="/revenue" element={<RevenueModelManagement />} />
        <Route path="/players" element={<PlayerManagement />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </Layout>
  );
};

export default SuperAdminLayout;