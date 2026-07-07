import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerGym, loginGym } from '../services/authService';
import { Mail, Lock, User, Building2, ArrowLeft, Eye, EyeOff, Zap } from 'lucide-react';

const InputIcon = ({ icon, children }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
      {icon}
    </div>
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
      await loginGym({ email, password });
        navigate('/pending-approval');

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
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden', background: 'var(--bg)'
    }}>
      {/* Ambient glow orbs */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost"
          style={{ padding: '8px 12px', marginBottom: '32px', width: 'auto' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
                VYRONIX
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Gym Management Platform
              </div>
            </div>
          </div>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 6px', fontFamily: 'var(--font-head)' }}>Register Your Gym</h1>
          <p style={{ color: 'var(--text-3)', margin: 0 }}>Set up your gym on VYRONIX in seconds</p>
        </div>

        <div style={{
          background: 'rgba(15,12,38,0.6)', border: '1px solid rgba(124,92,255,0.2)',
          borderRadius: '24px', padding: '32px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(124,92,255,0.06)'
        }}>
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

          <form onSubmit={handleRegister}>
            {/* Two-column row for Gym Name + Owner Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Gym Name</label>
                <InputIcon icon={<Building2 size={16} />}>
                  <input type="text" className="form-control" required placeholder="Muscle Factory" style={{ paddingLeft: '40px' }} value={gymName} onChange={e => setGymName(e.target.value)} />
                </InputIcon>
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Owner Name</label>
                <InputIcon icon={<User size={16} />}>
                  <input type="text" className="form-control" required placeholder="Your Name" style={{ paddingLeft: '40px' }} value={ownerName} onChange={e => setOwnerName(e.target.value)} />
                </InputIcon>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Email Address</label>
              <InputIcon icon={<Mail size={18} />}>
                <input type="email" className="form-control" required placeholder="gym@email.com" style={{ paddingLeft: '44px' }} value={email} onChange={e => setEmail(e.target.value)} />
              </InputIcon>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Password</label>
              <InputIcon icon={<Lock size={18} />}>
                <input type={showPass ? 'text' : 'password'} className="form-control" required placeholder="Min 6 characters" style={{ paddingLeft: '44px', paddingRight: '44px' }} value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </InputIcon>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Confirm Password</label>
              <InputIcon icon={<Lock size={18} />}>
                <input type="password" className="form-control" required placeholder="Repeat password" style={{ paddingLeft: '44px' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </InputIcon>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: loading
                  ? 'rgba(124,92,255,0.4)'
                  : 'linear-gradient(135deg, #7C5CFF 0%, #5DA9FF 100%)',
                color: '#fff', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,92,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.25s ease', marginTop: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Creating Gym...
                </>
              ) : (
                <><Zap size={18} /> Create My Gym</>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-3)', fontSize: '13px' }}>
          Already registered?{' '}
          <span onClick={() => navigate('/login')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }}>
            Login here →
          </span>
        </p>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default Register;
