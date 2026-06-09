import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerGym } from '../services/authService';
import { Dumbbell, Mail, Lock, User, Building2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const InputIcon = ({ icon, children, style = {} }) => (
  <div style={{ position: 'relative', ...style }}>
    <div style={{
      position: 'absolute', left: '14px', top: '50%',
      transform: 'translateY(-50%)', color: 'var(--text-3)',
      display: 'flex', alignItems: 'center'
    }}>{icon}</div>
    {children}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await registerGym({ email, password, gymName, ownerName });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Please login instead.'
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
         backgroundImage: 'url("https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop")',
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
        background: 'radial-gradient(circle, rgba(6,214,160,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ width: '100%', maxWidth: '420px', zIndex: 1 }} className="animate-fade-up">
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: 'var(--text-2)',
            cursor: 'pointer', marginBottom: '28px', fontSize: '0.9rem',
            fontFamily: 'var(--font)'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px', boxShadow: '0 4px 20px rgba(139,92,246,0.35)'
          }}>
            <Building2 size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', marginBottom: '6px' }}>
            Register Your Gym
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
            Set up your gym on PRANA AI in seconds
          </p>
        </div>

        <div className="card-glass-green" style={{
          borderRadius: '24px',
          padding: '32px',
          backdropFilter: 'blur(20px)'
        }}>
          {error && (
            <div style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '10px', padding: '12px 16px',
              marginBottom: '20px', color: 'var(--error)',
              fontSize: '0.9rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="grid-2" style={{ gap: '16px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Gym Name</label>
                <InputIcon icon={<Building2 size={16} />}>
                  <input
                    type="text" className="form-control" required
                    placeholder="Muscle Factory"
                    style={{ paddingLeft: '40px' }}
                    value={gymName}
                    onChange={e => setGymName(e.target.value)}
                  />
                </InputIcon>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Owner Name</label>
                <InputIcon icon={<User size={16} />}>
                  <input
                    type="text" className="form-control" required
                    placeholder="Your Name"
                    style={{ paddingLeft: '40px' }}
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                  />
                </InputIcon>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <InputIcon icon={<Mail size={18} />}>
                <input
                  type="email" className="form-control" required
                  placeholder="gym@email.com"
                  style={{ paddingLeft: '44px' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </InputIcon>
            </div>

            <div className="form-group">
              <label>Password</label>
              <InputIcon icon={<Lock size={18} />}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control" required
                  placeholder="Min 6 characters"
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: 'var(--text-3)', cursor: 'pointer'
                  }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </InputIcon>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <InputIcon icon={<Lock size={18} />}>
                <input
                  type="password" className="form-control" required
                  placeholder="Repeat password"
                  style={{ paddingLeft: '44px' }}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </InputIcon>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '8px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Creating Gym...
                </span>
              ) : '🏋️ Create My Gym'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-2)', fontSize: '0.9rem' }}>
          Already registered?{' '}
          <span onClick={() => navigate('/login')}
            style={{ color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600 }}>
            Login here →
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
