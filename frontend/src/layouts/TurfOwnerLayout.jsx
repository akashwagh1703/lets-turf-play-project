import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import TurfOwnerDashboard from '../pages/TurfOwnerDashboard';
import TurfForm from '../components/TurfForm';
import MyTurfs from '../components/MyTurfs';

const TurfOwnerLayout = () => {
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname.split('/')[2];
    switch (path) {
      case 'turfs': return 'turfs';
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
      </Routes>
    </Layout>
  );
};

export default TurfOwnerLayout;