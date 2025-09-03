import React, { useState } from 'react';
import { Menu, X, Home, Building, Calendar, Users, Settings, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileNavigation = ({ user, activeTab, setActiveTab, tabs }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (tabKey) => {
    const iconMap = {
      dashboard: Home,
      turfs: Building,
      bookings: Calendar,
      staff: Users,
      subscription: Crown,
      settings: Settings
    };
    return iconMap[tabKey] || Home;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white rounded-lg p-3 shadow-lg border border-gray-200"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user?.name || 'User'}</h3>
                    <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'User'}</p>
                  </div>
                </div>
              </div>

              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = getIcon(tab.key);
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    // Handle logout
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-4 gap-1 p-2">
          {tabs.slice(0, 4).map((tab) => {
            const Icon = getIcon(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;