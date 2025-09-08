import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { usePlayerAuth } from '../context/PlayerAuthContext';

const PlayerLayout = () => {
  const { player, logout, isAuthenticated } = usePlayerAuth();
  const location = useLocation();

  if (!isAuthenticated && !['/player/login', '/player/register'].includes(location.pathname)) {
    return <Navigate to="/player/login" replace />;
  }

  const navigation = [
    { name: 'Turfs', href: '/player/turfs', icon: '🏟️' },
    { name: 'My Bookings', href: '/player/bookings', icon: '📅' },
    { name: 'Profile', href: '/player/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/player/turfs" className="text-xl font-bold text-green-600">
                TurfPlay
              </Link>
            </div>

            {isAuthenticated && (
              <nav className="hidden md:flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.href
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-600 hover:text-green-600'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
            )}

            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Hi, {player?.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isAuthenticated && (
        <nav className="md:hidden bg-white border-b">
          <div className="flex overflow-x-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  location.pathname === item.href
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default PlayerLayout;