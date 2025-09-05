import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import TurfOwnerManagement from '../components/TurfOwnerManagement';
import TurfOwnerForm from '../components/TurfOwnerForm';
import TurfOwnerView from '../components/TurfOwnerView';
import DebugTurfOwner from '../components/DebugTurfOwner';
import ApiTest from '../components/ApiTest';
import SuperAdminTurfManagement from '../components/SuperAdminTurfManagement';
import TurfForm from '../components/TurfForm';
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
        <Route path="/owners/add" element={<TurfOwnerForm />} />
        <Route path="/owners/edit/:id" element={<TurfOwnerForm />} />
        <Route path="/owners/view/:id" element={<TurfOwnerView />} />
        <Route path="/owners/debug/:id" element={<DebugTurfOwner />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="/turfs" element={<SuperAdminTurfManagement />} />
        <Route path="/turfs/add" element={<TurfForm />} />
        <Route path="/turfs/edit/:id" element={<TurfForm />} />
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