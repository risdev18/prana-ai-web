import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, LogOut, Phone, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const PendingApproval = () => {
  const { logout, gymData, currentUser, refreshGymData, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [checking, setChecking] = useState(false);

  // If approved, redirect to dashboard automatically
  useEffect(() => {
    if (gymData && gymData.status === 'active') {
      navigate('/dashboard');
    } else if (gymData && hasPermission('superdashboard')) {
      navigate('/superadmin');
    }
  }, [gymData, navigate, hasPermission]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'GlobalSettings', 'appSettings'));
        if (snap.exists()) setSettings(snap.data());
      } catch (e) {
        console.error('Could not fetch global settings:', e);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      if (refreshGymData) await refreshGymData();
      // If now active, the ProtectedRoute will automatically redirect
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      color: '#fff',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{
        background: 'var(--bg-card)',
        padding: '48px 40px',
        borderRadius: '28px',
        border: '1px solid var(--border)',
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Animated icon */}
        <div style={{
          width: '88px', height: '88px',
          borderRadius: '50%',
          background: 'rgba(255, 171, 0, 0.1)',
          border: '2px solid rgba(255, 171, 0, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px auto',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <Clock size={40} color="#ffab00" />
        </div>

        <h2 style={{ marginBottom: '12px', fontSize: '24px' }}>Account Pending Approval</h2>
        <p style={{ color: 'var(--text-3)', lineHeight: '1.7', marginBottom: '32px', fontSize: '15px' }}>
          Your gym registration has been received successfully!
          <br /><br />
          Since payments are handled offline, an admin needs to manually activate your account after payment confirmation. Please contact the admin below:
        </p>

        {/* Contact Info */}
        {settings && (
          <div style={{
            background: 'rgba(124, 92, 255, 0.08)',
            border: '1px solid rgba(124, 92, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '28px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-2)' }}>Admin Contact</span>
            </div>
            {settings.supportPhone && settings.supportPhone !== 'Not Set' && (
              <a href={`tel:${settings.supportPhone}`} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 0', borderBottom: '1px solid var(--border)',
                color: '#fff', textDecoration: 'none', fontSize: '14px'
              }}>
                <Phone size={16} color="var(--primary)" />
                <span>{settings.supportPhone}</span>
              </a>
            )}
            {settings.supportEmail && settings.supportEmail !== 'anshu@admin.com' && (
              <a href={`mailto:${settings.supportEmail}`} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 0',
                color: '#fff', textDecoration: 'none', fontSize: '14px'
              }}>
                <Mail size={16} color="var(--primary)" />
                <span>{settings.supportEmail}</span>
              </a>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: '160px' }}
          >
            <RefreshCw size={16} style={{ animation: checking ? 'spin 1s linear infinite' : 'none' }} />
            {checking ? 'Checking...' : 'Check Status'}
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,171,0,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(255,171,0,0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PendingApproval;
