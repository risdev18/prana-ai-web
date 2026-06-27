import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

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
import Renewals from './pages/Renewals';
import Leads from './pages/Leads';
import Trainers from './pages/Trainers';
import Workouts from './pages/Workouts';
import Onboarding from './pages/Onboarding';
import Queries from './pages/Queries';
import Expenses from './pages/Expenses';
import Tickets from './pages/Tickets';

import './App.css';

const ProtectedRoute = ({ children, allowedFeature }) => {
  const { currentUser, hasPermission } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  
  if (allowedFeature && !hasPermission(allowedFeature)) {
    return <Navigate to="/dashboard" />;
  }

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
      <Route path="/dashboard" element={<ProtectedRoute allowedFeature="dashboard"><Dashboard /></ProtectedRoute>} />
      <Route path="/add-member" element={<ProtectedRoute allowedFeature="members"><AddMember /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute allowedFeature="members"><Members /></ProtectedRoute>} />
      
      {/* New Pages */}
      <Route path="/attendance" element={<ProtectedRoute allowedFeature="attendance"><Attendance /></ProtectedRoute>} />
      <Route path="/assessments" element={<ProtectedRoute allowedFeature="assessments"><AssessmentsList /></ProtectedRoute>} />
      <Route path="/assessment" element={<ProtectedRoute allowedFeature="assessments"><Assessment /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedFeature="reports"><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedFeature="settings"><Settings /></ProtectedRoute>} />
      <Route path="/renewals" element={<ProtectedRoute allowedFeature="renewals"><Renewals /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute allowedFeature="leads"><Leads /></ProtectedRoute>} />
      <Route path="/trainers" element={<ProtectedRoute allowedFeature="trainers"><Trainers /></ProtectedRoute>} />
      <Route path="/workouts" element={<ProtectedRoute allowedFeature="workouts"><Workouts /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute allowedFeature="settings"><Onboarding /></ProtectedRoute>} />
      <Route path="/queries" element={<ProtectedRoute allowedFeature="queries"><Queries /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute allowedFeature="expenses"><Expenses /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute allowedFeature="tickets"><Tickets /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 12, 38, 0.9)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(124, 92, 255, 0.25)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'var(--font)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 10px rgba(124, 92, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#00E676',
                secondary: '#111',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF5E7E',
                secondary: '#111',
              },
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
