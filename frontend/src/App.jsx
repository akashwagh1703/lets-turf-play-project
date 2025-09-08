import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerAuthProvider } from './context/PlayerAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import TurfOwnerLayout from './layouts/TurfOwnerLayout';
import StaffLayout from './layouts/StaffLayout';
import PlayerLayout from './layouts/PlayerLayout';
import PlayerLogin from './pages/player/PlayerLogin';
import PlayerRegister from './pages/player/PlayerRegister';
import PlayerProfile from './pages/player/PlayerProfile';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlayerAuthProvider>
          <Router>
            <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Player Portal Routes */}
              <Route path="/player" element={<PlayerLayout />}>
                <Route path="login" element={<PlayerLogin />} />
                <Route path="register" element={<PlayerRegister />} />
                <Route path="profile" element={<PlayerProfile />} />
                <Route path="turfs" element={<div className="text-center py-8">Turf Listing - Coming Soon</div>} />
                <Route path="bookings" element={<div className="text-center py-8">My Bookings - Coming Soon</div>} />
              </Route>
              
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
              <Route path="/" element={<Navigate to="/player/login" replace />} />
            </Routes>
            </div>
          </Router>
        </PlayerAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;