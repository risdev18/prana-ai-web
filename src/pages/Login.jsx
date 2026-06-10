import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginGym, resetPassword } from '../services/authService';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Zap } from 'lucide-react';

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
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
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
    <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost"
          style={{ padding: '8px', marginBottom: '32px', width: 'auto' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Zap size={24} color="#fff" />
          </div>
          <h1 style={{ marginBottom: '4px' }}>Welcome Back</h1>
          <p className="text-muted">Access your gym management dashboard</p>
        </div>

        <div className="card">
          {error && (
            <div style={{
              background: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: '8px',
              padding: '12px', marginBottom: '20px', color: 'var(--error)', fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          {resetMsg && (
            <div style={{
              background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: '8px',
              padding: '12px', marginBottom: '20px', color: 'var(--success)', fontSize: '14px'
            }}>
              {resetMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type="email" className="form-control" required
                  placeholder="name@example.com"
                  style={{ paddingLeft: '44px' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control" required
                  placeholder="••••••••"
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', marginTop: '-8px' }}>
              <span onClick={handleResetPassword} style={{ fontSize: '13px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>
                Forgot Password?
              </span>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-2)', fontSize: '14px' }}>
          Don't have a gym?{' '}
          <span onClick={() => navigate('/register')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
