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
import PrivacyPolicy from './pages/PrivacyPolicy';

import './App.css';

const ProtectedRoute = ({ children, allowedFeature }) => {
  const { currentUser, gymData, loading, hasPermission } = useAuth();

  // Show spinner ONLY while auth is initializing
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-main)', color: '#fff', gap: '20px'
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid rgba(124,92,255,0.2)',
          borderTop: '3px solid var(--primary)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Loading your workspace…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in at all
  if (!currentUser) return <Navigate to="/login" />;
  
  // Logged in but pending approval
  if (gymData && gymData.status === 'pending') {
    return <Navigate to="/pending-approval" />;
  }

  // Logged in but gym document missing — show setup/repair page
  if (!gymData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: '#fff', padding: '40px', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,171,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '32px' }}>⚙️</div>
        <h2 style={{ marginBottom: '12px' }}>Account Setup Needed</h2>
        <p style={{ color: 'var(--text-3)', marginBottom: '8px', maxWidth: '420px' }}>
          Signed in as <strong style={{ color: '#fff' }}>{currentUser.email}</strong>
        </p>
        <p style={{ color: 'var(--text-3)', marginBottom: '28px', maxWidth: '420px' }}>
          Your account exists but database setup is incomplete. Click below to complete it automatically.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={async () => {
            try {
              const { doc, setDoc, getDoc } = await import('firebase/firestore');
              const { db } = await import('./services/firebase');
              const isSuperAdmin = ['anshu@admin.com', 'rishabhsonawane18@gmail.com', 'sonawaneanshu18@gmail.com'].includes(currentUser.email?.toLowerCase());
              await setDoc(doc(db, 'Gyms', currentUser.uid), {
                gymId: currentUser.uid,
                gymName: isSuperAdmin ? 'Super Admin' : 'My Gym',
                ownerName: isSuperAdmin ? 'Anshu' : currentUser.email,
                email: currentUser.email,
                role: isSuperAdmin ? 'superadmin' : 'owner',
                status: isSuperAdmin ? 'active' : 'pending',
                createdAt: new Date().toISOString()
              });
              if (isSuperAdmin) {
                const settingsRef = doc(db, 'GlobalSettings', 'appSettings');
                const snap = await getDoc(settingsRef);
                if (!snap.exists()) {
                  await setDoc(settingsRef, { websiteName: 'Vyronix', supportEmail: 'support@vyronix.com', supportPhone: 'Not Set', supportIdImage: '' });
                }
                window.location.href = '/superadmin';
              } else {
                window.location.href = '/pending-approval';
              }
            } catch (e) {
              alert('Setup failed: ' + e.message);
            }
          }}>Complete Setup</button>
          <button className="btn btn-outline" onClick={() => window.location.href = '/login'}>Go to Login</button>
        </div>
      </div>
    );
  }

  if (allowedFeature && !hasPermission(allowedFeature)) {
    if (gymData?.role === 'superadmin') return <Navigate to="/superadmin" />;
    return <Navigate to="/dashboard" />;
  }

  // Wrap protected children in MainLayout
  return <MainLayout>{children}</MainLayout>;
};

import PendingApproval from './pages/PendingApproval';
import AppSupport from './pages/AppSupport';
import SuperDashboard from './pages/superadmin/SuperDashboard';
import SuperGyms from './pages/superadmin/SuperGyms';
import SuperSettings from './pages/superadmin/SuperSettings';
import SuperTickets from './pages/superadmin/SuperTickets';
import SuperAnalytics from './pages/superadmin/SuperAnalytics';

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

      {/* Pending Approval */}
      <Route path="/pending-approval" element={<PendingApproval />} />

      {/* Super Admin routes */}
      <Route path="/superadmin" element={<ProtectedRoute allowedFeature="superdashboard"><SuperDashboard /></ProtectedRoute>} />
      <Route path="/superadmin/gyms" element={<ProtectedRoute allowedFeature="supergyms"><SuperGyms /></ProtectedRoute>} />
      <Route path="/superadmin/analytics" element={<ProtectedRoute allowedFeature="superdashboard"><SuperAnalytics /></ProtectedRoute>} />
      <Route path="/superadmin/settings" element={<ProtectedRoute allowedFeature="supersettings"><SuperSettings /></ProtectedRoute>} />
      <Route path="/superadmin/tickets" element={<ProtectedRoute allowedFeature="supertickets"><SuperTickets /></ProtectedRoute>} />

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
      <Route path="/app-support" element={<ProtectedRoute allowedFeature="support"><AppSupport /></ProtectedRoute>} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

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
