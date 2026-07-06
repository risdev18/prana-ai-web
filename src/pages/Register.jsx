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
    <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost"
          style={{ padding: '8px', marginBottom: '32px', width: 'auto' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Zap size={24} color="#fff" />
          </div>
          <h1 style={{ marginBottom: '4px' }}>Register Your Gym</h1>
          <p className="text-muted">Set up your gym on VYRONIX in seconds</p>
        </div>

        <div className="card">
          {error && (
            <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: 'var(--error)', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="grid-2">
              <div className="form-group">
                <label>Gym Name</label>
                <InputIcon icon={<Building2 size={16} />}>
                  <input type="text" className="form-control" required placeholder="Muscle Factory" style={{ paddingLeft: '40px' }} value={gymName} onChange={e => setGymName(e.target.value)} />
                </InputIcon>
              </div>
              <div className="form-group">
                <label>Owner Name</label>
                <InputIcon icon={<User size={16} />}>
                  <input type="text" className="form-control" required placeholder="Your Name" style={{ paddingLeft: '40px' }} value={ownerName} onChange={e => setOwnerName(e.target.value)} />
                </InputIcon>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <InputIcon icon={<Mail size={18} />}>
                <input type="email" className="form-control" required placeholder="gym@email.com" style={{ paddingLeft: '44px' }} value={email} onChange={e => setEmail(e.target.value)} />
              </InputIcon>
            </div>

            <div className="form-group">
              <label>Password</label>
              <InputIcon icon={<Lock size={18} />}>
                <input type={showPass ? 'text' : 'password'} className="form-control" required placeholder="Min 6 characters" style={{ paddingLeft: '44px', paddingRight: '44px' }} value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </InputIcon>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <InputIcon icon={<Lock size={18} />}>
                <input type="password" className="form-control" required placeholder="Repeat password" style={{ paddingLeft: '44px' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </InputIcon>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4">
              {loading ? 'Creating Gym...' : 'Create My Gym'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-2)', fontSize: '14px' }}>
          Already registered?{' '}
          <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
