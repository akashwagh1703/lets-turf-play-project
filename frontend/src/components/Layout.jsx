import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';
import PerformanceMonitor from './PerformanceMonitor';
import { useNotifications } from '../hooks/useNotifications';

const Layout = ({ children, activeTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const { notifications } = useNotifications(user?.id);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationTabs = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'owners', label: 'Turf Owners', icon: '👥' },
          { id: 'turfs', label: 'All Turfs', icon: '🏟️' },
          { id: 'staff', label: 'Staff', icon: '👨💼' },
          { id: 'subscription', label: 'Subscriptions', icon: '👑' },
          { id: 'revenue', label: 'Revenue Models', icon: '💰' },
          { id: 'players', label: 'Players', icon: '🎮' },
        ];
      case 'turf_owner':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'turfs', label: 'My Turfs', icon: '🏟️' },
          { id: 'bookings', label: 'Bookings', icon: '📅' },
          { id: 'staff', label: 'Staff', icon: '👨‍💼' },
        ];
      case 'staff':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'bookings', label: 'Manage Bookings', icon: '📋' },
        ];
      default:
        return [];
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'super_admin': return 'from-purple-600 to-purple-800';
      case 'turf_owner': return 'from-blue-600 to-blue-800';
      case 'staff': return 'from-green-600 to-green-800';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'super_admin': return 'bg-purple-500';
      case 'turf_owner': return 'bg-blue-500';
      case 'staff': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const tabs = getNavigationTabs();
  const [activeTabState, setActiveTabState] = useState(activeTab);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Mobile Navigation */}
      <MobileNavigation 
        user={user} 
        activeTab={activeTabState} 
        setActiveTab={setActiveTabState} 
        tabs={tabs}
      />
      
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 hidden lg:block">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LT</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Lets Turf Play</h1>
              </div>
            </div>
            
            {/* Clean Navigation */}
            <nav className="flex space-x-1">
              {getNavigationTabs().map((tab) => (
                <Link
                  key={tab.id}
                  to={`/${user?.role === 'super_admin' ? 'admin' : user?.role === 'turf_owner' ? 'owner' : 'staff'}/${tab.id}`}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden md:block">{tab.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Performance & User Profile */}
          <div className="flex items-center space-x-4">
            {/* Performance Toggle */}
            <button
              onClick={() => setShowPerformance(!showPerformance)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50"
              title="Performance Monitor"
            >
              📊
            </button>
            
            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="relative">
                <button className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50">
                  🔔
                </button>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              </div>
            )}
            
            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-semibold text-sm">{user?.name?.charAt(0)}</span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-gray-900 font-medium text-sm">{user?.name}</p>
                  <p className="text-gray-500 text-xs">{user?.role?.replace('_', ' ')}</p>
                </div>
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link to={`/${user?.role === 'super_admin' ? 'admin' : user?.role === 'turf_owner' ? 'owner' : 'staff'}/profile`} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 text-gray-700">
                    <span>👤</span><span>Profile</span>
                  </Link>
                  <Link to={`/${user?.role === 'super_admin' ? 'admin' : user?.role === 'turf_owner' ? 'owner' : 'staff'}/settings`} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 text-gray-700">
                    <span>⚙️</span><span>Settings</span>
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                    <span>🚪</span><span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Performance Monitor */}
      {showPerformance && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <PerformanceMonitor />
        </div>
      )}
      
      {/* Content Area */}
      <main className="flex-1 overflow-hidden bg-gray-50/30 pb-16 lg:pb-0">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;