import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

const Splash = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (currentUser) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 48px', borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.02em' }}>
          <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#fff" />
          </div>
          PRANA AI
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/login')} className="btn btn-ghost">Log In</button>
          <button onClick={() => navigate('/register')} className="btn btn-primary">Start Free</button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '999px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--primary)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            <CheckCircle2 size={16} /> AI-Powered Gym Management Platform
          </div>
          
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
            color: 'var(--text)'
          }}>
            Manage Members, Attendance & Renewals in One Dashboard.
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-2)',
            maxWidth: '640px', margin: '0 auto 48px',
            lineHeight: 1.6
          }}>
            The professional operating system for your fitness business. Stop chasing payments and start growing your gym with smart automation.
          </p>
        </div>

        {/* Primary CTAs */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '900px' }}>
          {/* Gym Owner Portal (Primary) */}
          <div
            onClick={() => navigate('/register')}
            className="card"
            style={{ flex: '1 1 400px', cursor: 'pointer', position: 'relative', overflow: 'hidden', border: '2px solid var(--primary)', background: 'rgba(99,102,241,0.05)' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={24} color="#fff" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Gym Owner</h3>
            </div>
            <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>
              Create your gym, add members, track attendance, and automate renewals instantly.
            </p>
            <button className="btn btn-primary w-full">Create Your Gym Space</button>
          </div>

          {/* Member Portal (Secondary) */}
          <div
            onClick={() => navigate('/member-portal')}
            className="card"
            style={{ flex: '1 1 300px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} color="var(--accent)" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>I'm a Member</h3>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: '14px', marginBottom: '24px' }}>
              Access your gym profile, check your attendance streak, and view workout plans.
            </p>
            <button className="btn btn-outline w-full">Access Member Portal</button>
          </div>
        </div>

        {/* Social Proof */}
        <div style={{ marginTop: '80px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '48px', width: '100%', maxWidth: '800px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '32px' }}>
            Trusted by growing fitness businesses
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>250+</div>
              <div style={{ color: 'var(--text-2)', fontSize: '14px' }}>Gyms Onboarded</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>15,000+</div>
              <div style={{ color: 'var(--text-2)', fontSize: '14px' }}>Active Members</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>99.9%</div>
              <div style={{ color: 'var(--text-2)', fontSize: '14px' }}>Uptime Reliability</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Splash;
