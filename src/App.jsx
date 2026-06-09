import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import MemberPortal from './pages/MemberPortal';
import MemberDashboard from './pages/MemberDashboard';
import CheckIn from './pages/CheckIn';

// Protected pages
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import AddMember from './pages/AddMember';
import Members from './pages/Members'; // The unified hub
import Assessment from './pages/Assessment'; // Assessment view
import Attendance from './pages/Attendance';
import AssessmentsList from './pages/AssessmentsList';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  // Wrap protected children in MainLayout
  return <MainLayout>{children}</MainLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Member portal — no login required */}
      <Route path="/member-portal" element={<MemberPortal />} />
      <Route path="/member-dashboard" element={<MemberDashboard />} />
      <Route path="/checkin/:gymId" element={<CheckIn />} />

      {/* Owner protected routes - wrapped by ProtectedRoute which adds MainLayout */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/add-member" element={<ProtectedRoute><AddMember /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
      
      {/* New Pages */}
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/assessments" element={<ProtectedRoute><AssessmentsList /></ProtectedRoute>} />
      <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
