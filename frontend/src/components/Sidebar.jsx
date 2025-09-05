import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '■', path: '/admin/dashboard' },
          { id: 'owners', label: 'Turf Owners', icon: '▲', path: '/admin/owners' },
          { id: 'turfs', label: 'All Turfs', icon: '●', path: '/admin/turfs' },
          { id: 'staff', label: 'Staff', icon: '♦', path: '/admin/staff' },
          { id: 'subscription', label: 'Subscriptions', icon: '★', path: '/admin/subscription' },
          { id: 'revenue', label: 'Revenue Models', icon: '◆', path: '/admin/revenue' },
          { id: 'players', label: 'Players', icon: '♠', path: '/admin/players' },
        ];
      case 'turf_owner':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '■', path: '/owner/dashboard' },
          { id: 'turfs', label: 'My Turfs', icon: '●', path: '/owner/turfs' },
          { id: 'bookings', label: 'Bookings', icon: '▼', path: '/owner/bookings' },
          { id: 'staff', label: 'Staff', icon: '♦', path: '/owner/staff' },
        ];
      case 'staff':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '■', path: '/staff/dashboard' },
          { id: 'bookings', label: 'Manage Bookings', icon: '▼', path: '/staff/bookings' },
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

  const navigationItems = getNavigationItems();
  const currentPath = location.pathname;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <motion.div
        initial={{ width: 280 }}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-lg flex flex-col h-full relative z-50"
      >
      {/* Header with Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-4"
              >
                {/* Logo Container */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-gray-900 via-black to-gray-800 rounded-2xl flex items-center justify-center w-12 h-12 shadow-xl scale-hover logo-glow">
                    <span className="text-white font-black text-lg tracking-tight">LTP</span>
                  </div>
                </div>
                
                {/* Brand Text */}
                <div className="flex flex-col">
                  <h1 className="text-lg font-black gradient-text tracking-tight leading-none">
                    Lets Turf Play
                  </h1>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">
                    Admin Portal
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex justify-center"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-gray-900 via-black to-gray-800 rounded-2xl flex items-center justify-center w-10 h-10 shadow-xl scale-hover logo-glow">
                    <span className="text-white font-bold text-sm tracking-tight">LTP</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
                />
              )}
              
              {/* Icon */}
              <span className={`text-lg font-bold transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'
              }`}>
                {item.icon}
              </span>
              
              {/* Label */}
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer with User Info */}
      <div className="p-4 border-t border-gray-100">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${getRoleColor()} rounded-lg flex items-center justify-center shadow-md`}>
                  <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{user?.name}</h3>
                  <p className="text-xs text-gray-500 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Admin Portal v1.0</div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className={`w-8 h-8 bg-gradient-to-r ${getRoleColor()} rounded-lg flex items-center justify-center shadow-md`}>
                <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </>
  );
};

export default Sidebar;