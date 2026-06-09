import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMemberByShortId, getAttendanceRecordFull, markAttendance, updateCheckOutTime } from '../services/firestoreService';
import { CheckCircle, XCircle, AlertTriangle, LogOut } from 'lucide-react';

const CheckIn = () => {
  const { gymId } = useParams();
  const [shortId, setShortId] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, checkout, error, expired, done
  const [message, setMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!shortId.trim()) return;

    setStatus('loading');
    setMessage('');
    setSubMessage('');

    try {
      // 1. Fetch Member
      const member = await getMemberByShortId(gymId, shortId.trim().toUpperCase());
      if (!member) {
        setStatus('error');
        setMessage('Member Not Found');
        setSubMessage('Check your ID and try again.');
        return;
      }

      // 2. Check Expiry
      if (member.membershipEndDate && new Date(member.membershipEndDate) < new Date(todayStr)) {
        setStatus('expired');
        setMessage('Membership Expired');
        setSubMessage('Please contact your gym owner to renew.');
        return;
      }

      // 3. Get existing attendance record
      const existing = await getAttendanceRecordFull(gymId, todayStr, member.id);

      if (!existing) {
        // First scan → Check IN
        await markAttendance(gymId, todayStr, member.id, member.memberName);
        setStatus('success');
        setMessage(`Welcome, ${member.memberName}! 💪`);
        setSubMessage(`Check-In at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } else if (!existing.checkOutTime) {
        // Second scan → Check OUT
        await updateCheckOutTime(gymId, todayStr, member.id);
        setStatus('checkout');
        setMessage(`See you next time, ${member.memberName}! 👋`);
        setSubMessage(`Check-Out at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } else {
        // Third+ scan → Already done for today
        setStatus('done');
        setMessage('Session Already Completed');
        setSubMessage("You've already checked in and out today. See you tomorrow!");
      }

      setTimeout(() => {
        setShortId('');
        setStatus('idle');
        setMessage('');
        setSubMessage('');
      }, 6000);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Something went wrong');
      setSubMessage('Please try again in a moment.');
    }
  };

  const statusConfig = {
    success:  { color: '#06d6a0', icon: <CheckCircle size={64} color="#06d6a0" /> },
    checkout: { color: '#6366f1', icon: <LogOut size={64} color="#6366f1" /> },
    expired:  { color: '#f59e0b', icon: <AlertTriangle size={64} color="#f59e0b" /> },
    done:     { color: '#6366f1', icon: <CheckCircle size={64} color="#6366f1" /> },
    error:    { color: '#f43f5e', icon: <XCircle size={64} color="#f43f5e" /> },
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px', background: 'var(--bg)', position: 'relative', overflow: 'hidden'
    }}>
      {/* BG Image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.2, mixBlendMode: 'screen', pointerEvents: 'none'
      }} />

      <div className="card-glass-blue" style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px',
        padding: '44px 32px', borderRadius: '28px', textAlign: 'center',
        border: '1px solid rgba(99,102,241,0.3)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.1)'
      }}>

        {status === 'idle' || status === 'loading' ? (
          <>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🏋️</div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', marginBottom: '8px' }}>
              Gym Check-In
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: '32px' }}>
              Enter your Member ID to check in.<br />
              <span style={{ color: '#06d6a0', fontWeight: 600 }}>Scan again to check out.</span>
            </p>

            <form onSubmit={handleCheckIn}>
              <input
                type="text"
                placeholder="e.g. RSGYM-1023"
                value={shortId}
                onChange={(e) => setShortId(e.target.value.toUpperCase())}
                style={{
                  width: '100%', padding: '18px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', fontSize: '1.4rem', textAlign: 'center', letterSpacing: '3px',
                  marginBottom: '20px', textTransform: 'uppercase', boxSizing: 'border-box'
                }}
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  width: '100%', padding: '18px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #06d6a0 0%, #04b285 100%)',
                  color: '#fff', fontSize: '1.1rem', fontWeight: 800, border: 'none', cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(6,214,160,0.4)',
                  opacity: status === 'loading' ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {status === 'loading' ? 'Verifying...' : 'SUBMIT'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {statusConfig[status]?.icon}
            </div>
            <h2 style={{
              fontSize: '1.5rem', fontWeight: 900,
              color: statusConfig[status]?.color,
              marginBottom: '10px', fontFamily: 'var(--font-head)'
            }}>
              {message}
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1rem', marginBottom: '30px' }}>
              {subMessage}
            </p>
            <button
              onClick={() => { setStatus('idle'); setShortId(''); }}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                padding: '12px 24px', borderRadius: '10px', color: 'var(--text-2)',
                cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
