import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Database, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30
    },
    system: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Kolkata'
    }
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    toast.success('Setting updated');
  };

  return (
    <div className="h-full bg-gray-50/30 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          </div>

          <div className="space-y-8">
            {/* Notifications */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Email Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Push Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">SMS Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms}
                      onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Two-Factor Authentication</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactor}
                      onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Session Timeout (minutes)</span>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
            </div>

            {/* System */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">System</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Theme</span>
                  <select
                    value={settings.system.theme}
                    onChange={(e) => handleSettingChange('system', 'theme', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Language</span>
                  <select
                    value={settings.system.language}
                    onChange={(e) => handleSettingChange('system', 'language', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Timezone</span>
                  <select
                    value={settings.system.timezone}
                    onChange={(e) => handleSettingChange('system', 'timezone', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="Asia/Mumbai">Asia/Mumbai</option>
                    <option value="Asia/Delhi">Asia/Delhi</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemSettings;