import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';
import PerformanceMonitor from './PerformanceMonitor';
import Sidebar from './Sidebar';
import { useNotifications } from '../hooks/useNotifications';
import '../styles/header-animations.css';

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
          { id: 'dashboard', label: 'Dashboard', icon: '■' },
          { id: 'owners', label: 'Turf Owners', icon: '▲' },
          { id: 'turfs', label: 'All Turfs', icon: '●' },
          { id: 'staff', label: 'Staff', icon: '♦' },
          { id: 'subscription', label: 'Subscriptions', icon: '★' },
          { id: 'revenue', label: 'Revenue Models', icon: '◆' },
          { id: 'players', label: 'Players', icon: '♠' },
        ];
      case 'turf_owner':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '■' },
          { id: 'turfs', label: 'My Turfs', icon: '●' },
          { id: 'bookings', label: 'Bookings', icon: '▼' },
          { id: 'staff', label: 'Staff', icon: '♦' },
        ];
      case 'staff':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '■' },
          { id: 'bookings', label: 'Manage Bookings', icon: '▼' },
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
    <div className="h-screen flex bg-white">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex">
        <Sidebar user={user} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <MobileNavigation 
            user={user} 
            activeTab={activeTabState} 
            setActiveTab={setActiveTabState} 
            tabs={tabs}
          />
        </div>
      
      {/* Enhanced Modern Header */}
      <header className="header-glass shadow-enhanced border-b border-gray-200/50 flex-shrink-0 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-3">
          <div></div>
          
          {/* Enhanced Right Section */}
          <div className="flex items-center space-x-3">
            {/* Role Badge */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-enhanced role-badge-shimmer ${
              getRoleBadgeColor()
            }`}>
              {user?.role?.replace('_', ' ').toUpperCase()}
            </div>
            
            {/* Performance Monitor Toggle */}
            <button
              onClick={() => setShowPerformance(!showPerformance)}
              className={`ripple relative p-3 rounded-xl transition-all duration-300 group color-transition ${
                showPerformance 
                  ? 'bg-blue-100 text-blue-600 shadow-enhanced' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title="Performance Monitor"
            >
              <span className="icon-bounce text-lg font-bold transition-transform duration-300 group-hover:scale-110">■</span>
              {showPerformance && (
                <div className="absolute inset-0 bg-blue-500/20 rounded-xl animate-pulse"></div>
              )}
            </button>
            
            {/* Enhanced Notifications */}
            <div className="relative">
              <button className="ripple relative p-3 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 group color-transition">
                <span className="icon-bounce text-lg font-bold transition-transform duration-300 group-hover:scale-110">●</span>
                {notifications.length > 0 && (
                  <>
                    <span className="notification-pulse absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-enhanced">
                      {notifications.length > 99 ? '99+' : notifications.length}
                    </span>
                    <div className="absolute -top-1 -right-1 bg-red-400 rounded-full w-6 h-6 animate-ping opacity-75"></div>
                  </>
                )}
              </button>
            </div>
            
            {/* Enhanced User Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="ripple relative flex items-center space-x-3 hover:bg-gray-50 rounded-2xl p-2 transition-all duration-300 group color-transition"
              >
                {/* Avatar with role-based gradient */}
                <div className={`scale-hover relative w-12 h-12 bg-gradient-to-r ${getRoleColor()} rounded-xl flex items-center justify-center shadow-enhanced transition-all duration-300`}>
                  <span className="text-white font-bold text-lg">{user?.name?.charAt(0)}</span>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* User info */}
                <div className="hidden xl:block text-left">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{user?.name}</p>
                  <p className="text-xs text-gray-500 leading-tight">{user?.email}</p>
                </div>
                
                {/* Dropdown indicator */}
                <div className={`text-gray-400 transition-transform duration-300 ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}>
                  <span className="text-sm">▼</span>
                </div>
              </button>
              
              {/* Enhanced Dropdown */}
              {isProfileOpen && (
                <div className="dropdown-animate absolute right-0 mt-3 w-72 header-glass rounded-2xl shadow-enhanced border border-gray-200/50 py-3 z-50">
                  {/* User Info Header */}
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getRoleColor()} rounded-xl flex items-center justify-center shadow-md`}>
                        <span className="text-white font-bold text-lg">{user?.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium text-white mt-1 ${getRoleBadgeColor()}`}>
                          {user?.role?.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <Link 
                      to={`/${user?.role === 'super_admin' ? 'admin' : user?.role === 'turf_owner' ? 'owner' : 'staff'}/profile`} 
                      className="ripple flex items-center space-x-3 px-5 py-3 text-sm hover:bg-gray-50 color-transition text-gray-700 hover:text-gray-900"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <span className="text-blue-500 font-bold">♦</span>
                      <span className="font-medium">My Profile</span>
                    </Link>
                    <Link 
                      to={`/${user?.role === 'super_admin' ? 'admin' : user?.role === 'turf_owner' ? 'owner' : 'staff'}/settings`} 
                      className="ripple flex items-center space-x-3 px-5 py-3 text-sm hover:bg-gray-50 color-transition text-gray-700 hover:text-gray-900"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <span className="text-green-500 font-bold">▲</span>
                      <span className="font-medium">Settings</span>
                    </Link>
                    <div className="border-t border-gray-100 my-2"></div>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }} 
                      className="ripple w-full flex items-center space-x-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 color-transition hover:text-red-700"
                    >
                      <span className="text-red-500 font-bold">●</span>
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Enhanced Performance Monitor */}
      {showPerformance && (
        <div className="border-b border-gray-200/50 p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-blue-600 font-bold text-lg">■</span>
              <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
            </div>
            <PerformanceMonitor />
          </div>
        </div>
      )}
      
        {/* Content Area */}
        <main className="flex-1 overflow-hidden bg-gray-50/30 pb-20 lg:pb-0">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;