import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import Landing from './pages/Landing';
import StudentDashboard from './pages/student/Dashboard';
import Tests from './pages/student/Tests';
import TakeTest from './pages/student/TakeTest';
import Analysis from './pages/student/Analysis';
import MockInterview from './pages/student/MockInterview';
import Jobs from './pages/student/Jobs';
import Placement from './pages/student/Placement';
import Profile from './pages/student/Profile';

import OfficerDashboard from './pages/officer/OfficerDashboard';
import CreateDrive from './pages/officer/CreateDrive';
import Applications from './pages/officer/Applications';

import AdminDashboard from './pages/admin/AdminDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';

const ROLE_HOME_MAP = {
  STUDENT: '/student',
  PLACEMENT_OFFICER: '/officer',
  COMPANY: '/company',
  ADMIN: '/admin'
};

const getRoleHome = (role) => {
  if (!role) return null;
  return ROLE_HOME_MAP[role.toUpperCase()] || null;
};

function ProtectedRoute({ children, allowedRole }) {
  const { token, role, logout } = useAuthStore();
  const roleHome = getRoleHome(role);
  const isAuthenticated = Boolean(token && roleHome);

  if (!isAuthenticated) {
    if (token && !roleHome) {
      logout();
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role?.toUpperCase() !== allowedRole.toUpperCase()) {
    return <Navigate to={roleHome} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  const { token, role, logout } = useAuthStore();
  const roleHome = getRoleHome(role);
  const isAuthenticated = Boolean(token && roleHome);

  // If token is present in localStorage but role is missing or corrupt, clear it safely
  useEffect(() => {
    if (token && !roleHome) {
      logout();
    }
  }, [token, roleHome, logout]);

  const defaultRedirect = isAuthenticated ? roleHome : '/login';

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={roleHome} replace /> : <Login />}
        />
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />

        {/* Student Portal Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tests"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <Tests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tests/:attemptId"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <TakeTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/analysis"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <Analysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/interview"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <MockInterview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/jobs"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/placement"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <Placement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Placement Officer Operations Routes */}
        <Route
          path="/officer"
          element={
            <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/drives"
          element={
            <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/drives/new"
          element={
            <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
              <CreateDrive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/drives/:driveId/applications"
          element={
            <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/applications"
          element={
            <ProtectedRoute allowedRole="PLACEMENT_OFFICER">
              <Applications />
            </ProtectedRoute>
          }
        />

        {/* Corporate Partner Portal Routes */}
        <Route
          path="/company"
          element={
            <ProtectedRoute allowedRole="COMPANY">
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/drives"
          element={
            <ProtectedRoute allowedRole="COMPANY">
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />

        {/* System Administration Console Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
