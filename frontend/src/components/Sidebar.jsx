import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Users, 
  Building2, 
  UserCheck, 
  CreditCard, 
  DollarSign, 
  Trophy, 
  Calendar, 
  BarChart3
} from 'lucide-react';

const Sidebar = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
          { id: 'owners', label: 'Turf Owners', icon: Users, path: '/admin/owners' },
          { id: 'turfs', label: 'All Turfs', icon: Building2, path: '/admin/turfs' },
          { id: 'staff', label: 'Staff', icon: UserCheck, path: '/admin/staff' },
          { id: 'subscription', label: 'Subscriptions', icon: CreditCard, path: '/admin/subscription' },
          { id: 'revenue', label: 'Revenue Models', icon: DollarSign, path: '/admin/revenue' },
          { id: 'players', label: 'Players', icon: Trophy, path: '/admin/players' },
        ];
      case 'turf_owner':
        const baseItems = [
          { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/owner/dashboard' },
          { id: 'turfs', label: 'My Turfs', icon: Building2, path: '/owner/turfs' },
          { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/owner/bookings' },
          { id: 'staff', label: 'Staff', icon: UserCheck, path: '/owner/staff' },
        ];
        
        // Add Analytics if user has Advanced Analytics feature
        // For now, always show it (will be controlled by dashboard access)
        baseItems.push({ id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/owner/analytics' });
        
        return baseItems;
      case 'staff':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/staff/dashboard' },
          { id: 'bookings', label: 'Manage Bookings', icon: Calendar, path: '/staff/bookings' },
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
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? 
              <ChevronRight size={18} className="text-gray-600" /> : 
              <ChevronLeft size={18} className="text-gray-600" />
            }
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
              className={`relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
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
              <div className={`${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'} rounded-lg flex items-center justify-center transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg transform scale-105' 
                  : 'bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-gray-700 group-hover:to-gray-800 group-hover:shadow-md group-hover:scale-105'
              }`}>
                <item.icon 
                  size={isCollapsed ? 20 : 16} 
                  className={`transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-white'
                  }`} 
                />
              </div>
              
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