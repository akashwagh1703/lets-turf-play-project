import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, User, LogOut } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getUnreadCount } from '../../services/notificationService'
import { useAuth } from '../../hooks/useAuth'

export const Navbar: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    enabled: !!user
  })

  const navigation = [
    { name: 'Search', href: '/search' },
    { name: 'My Bookings', href: '/bookings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsProfileOpen(false)
  }

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-40 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold text-dark">TurfBooker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-1 py-2 text-sm font-medium transition-colors ${
                    location.pathname.startsWith(item.href)
                      ? 'text-dark'
                      : 'text-gray-500 hover:text-dark'
                  }`}
                >
                  {item.name}
                  {location.pathname.startsWith(item.href) &&
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  }
                </Link>
              ))}

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-2 text-gray-500 hover:text-dark transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-dark transition-colors"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
