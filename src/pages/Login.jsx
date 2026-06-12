import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginGym, resetPassword } from '../services/authService';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Zap, Shield, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setResetMsg('');
    setLoading(true);
    try {
      await loginGym({ email, password });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) { setError('Please enter your email address first.'); return; }
    setError('');
    setResetMsg('');
    try {
      await resetPassword(email);
      setResetMsg('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Ambient glow orbs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Back button */}
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ marginBottom: '32px', width: 'auto', padding: '8px 12px' }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Brand logo */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #7C5CFF 0%, #5DA9FF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(124,92,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
              <Zap size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '1.5rem', background: 'linear-gradient(135deg, #fff 0%, #a18cff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PRANA AI
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Gym Management Platform
              </div>
            </div>
          </div>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 6px', fontFamily: 'var(--font-head)' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-3)', margin: 0 }}>Sign in to access your gym command center</p>
        </div>

        {/* Login card */}
        <div style={{
          background: 'rgba(15,12,38,0.6)', border: '1px solid rgba(124,92,255,0.2)',
          borderRadius: '24px', padding: '32px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(124,92,255,0.06)'
        }}>
          {/* Shimmer top border */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,92,255,0.6), transparent)', borderRadius: '24px 24px 0 0' }} />

          {error && (
            <div style={{
              background: 'rgba(255,94,126,0.08)', border: '1px solid rgba(255,94,126,0.3)',
              borderRadius: '10px', padding: '12px 16px',
              marginBottom: '20px', color: 'var(--error)', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {resetMsg && (
            <div style={{
              background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.3)',
              borderRadius: '10px', padding: '12px 16px',
              marginBottom: '20px', color: 'var(--success)', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              ✅ {resetMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type="email" className="form-control" required
                  placeholder="name@example.com"
                  style={{ paddingLeft: '44px' }}
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type={showPass ? 'text' : 'password'} className="form-control" required
                  placeholder="••••••••"
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', marginTop: '-8px' }}>
              <span onClick={handleResetPassword} style={{ fontSize: '12px', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.02em' }}>
                Forgot password?
              </span>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              background: loading
                ? 'rgba(124,92,255,0.4)'
                : 'linear-gradient(135deg, #7C5CFF 0%, #5DA9FF 100%)',
              color: '#fff', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(124,92,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,92,255,0.5)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,92,255,0.4)'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                <>
                  <Zap size={18} /> Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Trust indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { icon: <Shield size={13} />, label: 'Secure Login' },
              { icon: <Sparkles size={13} />, label: 'AI Powered' },
            ].map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-3)', fontWeight: 600 }}>
                {b.icon} {b.label}
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-3)', fontSize: '13px' }}>
          New to Prana AI?{' '}
          <span onClick={() => navigate('/register')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }}>
            Register your gym →
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
