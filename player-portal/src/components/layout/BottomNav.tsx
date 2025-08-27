import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Calendar, Bell, User } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/search', label: 'Search', icon: Search },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/logo', label: 'Home', icon: null }, // Placeholder for logo
  { href: '/notifications', label: 'Alerts', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
]

export const BottomNav: React.FC = () => {
  const location = useLocation()

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-lg border-t border-gray-200 md:hidden z-40"
    >
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          if (item.href === '/logo') {
            return (
              <Link to="/search" key={item.href} className="flex flex-col items-center justify-center w-full h-full relative -mt-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-white font-bold text-3xl">T</span>
                </div>
              </Link>
            )
          }

          const isActive = location.pathname.startsWith(item.href)
          return (
            <Link to={item.href} key={item.href} className="flex flex-col items-center justify-center w-full h-full relative">
              <item.icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? 'text-dark' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-xs mt-1 transition-colors ${
                  isActive ? 'text-dark font-semibold' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-underline"
                  className="absolute bottom-1.5 h-1 w-6 bg-primary rounded-full"
                />
              )}
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
