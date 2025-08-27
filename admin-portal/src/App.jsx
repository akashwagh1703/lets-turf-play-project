import { Route, Routes, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Bookings from './pages/Bookings.jsx'
import Users from './pages/Users.jsx'
import Reports from './pages/Reports.jsx'
import { AuthProvider } from './store/AuthContext.jsx'
import RequireAuth from './routes/RequireAuth.jsx'
import RequireRole from './routes/RequireRole.jsx'
import Roles from './pages/Roles.jsx'
import TurfManagement from './pages/TurfManagement.jsx'
import ContentSettings from './pages/ContentSettings.jsx'
import RevenuePlans from './pages/RevenuePlans.jsx'
import BookingManagement from './pages/BookingManagement.jsx'
import AvailabilityManagement from './pages/AvailabilityManagement.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Roles */}
          <Route path="/roles" element={<RequireRole roles={['Admin']}><Roles /></RequireRole>} />
          {/* Turf Management */}
          <Route path="/turfs" element={<RequireRole roles={['Admin', 'Manager']}><TurfManagement /></RequireRole>} />
          <Route path="/bookings" element={<RequireRole roles={['Admin','Manager','Staff']}><BookingManagement /></RequireRole>} />
          {/* AvailabilityManagement */}
          <Route path="/availability" element={<RequireRole roles={['Manager']}><AvailabilityManagement /></RequireRole>} />
          <Route path="/users" element={<RequireRole roles={['Admin']}><Users /></RequireRole>} />
          <Route path="/reports" element={<RequireRole roles={['Admin','Manager', 'Staff']}><Reports /></RequireRole>} />
          {/* Revenue & Plans */}
          <Route path="/revenue-plans" element={<RequireRole roles={['Admin', 'Manager']}><RevenuePlans /></RequireRole>} />
          {/* Content & Settings */}
          <Route path="/settings" element={<RequireRole roles={['Admin']}><ContentSettings /></RequireRole>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
