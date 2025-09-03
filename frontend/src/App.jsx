import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import TurfOwnerLayout from './layouts/TurfOwnerLayout';
import StaffLayout from './layouts/StaffLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Super Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminLayout />
                </ProtectedRoute>
              } 
            />
            
            {/* Turf Owner Routes */}
            <Route 
              path="/owner/*" 
              element={
                <ProtectedRoute allowedRoles={['turf_owner']}>
                  <TurfOwnerLayout />
                </ProtectedRoute>
              } 
            />
            
            {/* Staff Routes */}
            <Route 
              path="/staff/*" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffLayout />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/unauthorized" element={<div className="text-center mt-8">Unauthorized Access</div>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;