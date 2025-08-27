import React from 'react';
import { Twitter, Instagram, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-dark-foreground hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold text-white">TurfBooker</span>
            </div>
            <p className="text-sm text-gray-400">
              The easiest way to find and book your favorite sports turf.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="/search" className="text-base text-gray-400 hover:text-white">Search Turfs</a></li>
              <li><a href="/bookings" className="text-base text-gray-400 hover:text-white">My Bookings</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Cancellation Policy</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
             <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Follow Us</h3>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center">
          <p className="text-base text-gray-400">&copy; 2025 TurfBooker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
