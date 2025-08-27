import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { LazyMotion, domAnimation } from 'framer-motion'
import { AuthContext, useAuthState } from './hooks/useAuth'
import { Navbar } from './components/layout/Navbar'
import { BottomNav } from './components/layout/BottomNav'
import { Footer } from './components/layout/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AnimatedLoader } from './components/ui/AnimatedLoader'

// Pages
import { LoginPage } from './pages/LoginPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { SearchPage } from './pages/SearchPage'
import { TurfDetailPage } from './pages/TurfDetailPage'
import { BookingPage } from './pages/BookingPage'
import { BookingSuccessPage } from './pages/BookingSuccessPage'
import { BookingsPage } from './pages/BookingsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const AppContent: React.FC = () => {
  const authState = useAuthState()

  return (
    <AuthContext.Provider value={authState}>
      {authState.isLoading ? (
        <AnimatedLoader />
      ) : (
        <Router>
          <div className="min-h-screen bg-background flex flex-col">
            {authState.isAuthenticated && <Navbar />}
            
            <main className="flex-grow pb-20 md:pb-0">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                
                {/* Protected Routes */}
                <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                <Route path="/turf/:id" element={<ProtectedRoute><TurfDetailPage /></ProtectedRoute>} />
                <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
                <Route path="/booking-success" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                
                {/* Default Redirects */}
                <Route path="/" element={
                  authState.isAuthenticated ? 
                    <Navigate to="/search" replace /> : 
                    <Navigate to="/login" replace />
                } />
                <Route path="*" element={
                  <Navigate to={authState.isAuthenticated ? "/search" : "/login"} replace />
                } />
              </Routes>
            </main>
            
            {authState.isAuthenticated && <BottomNav />}
            {authState.isAuthenticated && <Footer />}
          </div>
        </Router>
      )}
    </AuthContext.Provider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation}>
        <AppContent />
      </LazyMotion>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
