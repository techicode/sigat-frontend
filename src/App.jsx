import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard';
import Assets from './components/Assets';
import Software from './components/Software';
import Licenses from './components/Licenses';
import Warnings from './components/Warnings';
import HardwareObsolescence from './components/HardwareObsolescence';
import Reports from './components/Reports';
import Users from './components/Users';
import Departments from './components/Departments';
import Staff from './components/Staff';
import AuditLog from './components/AuditLog';
import CheckIns from './components/CheckIns';
import CheckInForm from './components/CheckInForm';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/checkin/:token" element={<CheckInForm />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assets" element={<Assets />} />
            <Route path="software" element={<Software />} />
            <Route path="licenses" element={<Licenses />} />
            <Route path="warnings" element={<Warnings />} />
            <Route path="hardware-obsolescence" element={<HardwareObsolescence />} />
            <Route path="reports" element={<Reports />} />
            <Route path="checkins" element={<CheckIns />} />
            <Route path="users" element={<Users />} />
            <Route path="departments" element={<Departments />} />
            <Route path="staff" element={<Staff />} />
            <Route path="audit-logs" element={<AuditLog />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
