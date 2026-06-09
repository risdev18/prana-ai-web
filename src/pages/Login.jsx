import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginGym } from '../services/authService';
import { Dumbbell, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px', position: 'relative'
    }}>
      {/* BG Image */}
      <div style={{
         position: 'fixed', inset: 0,
         backgroundImage: 'url("https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop")',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         opacity: 0.2,
         filter: 'contrast(1.2) grayscale(0.2)',
         mixBlendMode: 'screen',
         pointerEvents: 'none', zIndex: 0
      }} />

      {/* BG Orb */}
      <div style={{
        position: 'fixed', top: '-15%', right: '-10%',
        width: '450px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ width: '100%', maxWidth: '420px', zIndex: 1 }} className="animate-fade-up">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: 'var(--text-2)',
            cursor: 'pointer', marginBottom: '32px', fontSize: '0.9rem',
            fontFamily: 'var(--font)'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px', boxShadow: '0 4px 20px rgba(99,102,241,0.35)'
          }}>
            <Dumbbell size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', marginBottom: '6px' }}>
            Gym Owner Login
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
            Access your gym management dashboard
          </p>
        </div>

        <div className="card-glass-blue" style={{
          borderRadius: '24px',
          padding: '32px',
          backdropFilter: 'blur(20px)'
        }}>
          {error && (
            <div style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: 'var(--error)',
              fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-3)'
                }} />
                <input
                  type="email" className="form-control" required
                  placeholder="your@email.com"
                  style={{ paddingLeft: '44px' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-3)'
                }} />
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
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: 'var(--text-3)', cursor: 'pointer'
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Logging in...
                </span>
              ) : 'Login to Dashboard'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-2)', fontSize: '0.9rem' }}>
          Don't have a gym?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600 }}
          >
            Register here →
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
