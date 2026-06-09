import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddMember from './pages/AddMember';
import MemberList from './pages/MemberList';
import Assessment from './pages/Assessment';
import MemberPortal from './pages/MemberPortal';
import MemberDashboard from './pages/MemberDashboard';
import CheckIn from './pages/CheckIn';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  return children;
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

      {/* Owner protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/add-member" element={<ProtectedRoute><AddMember /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><MemberList /></ProtectedRoute>} />
      <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />

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
