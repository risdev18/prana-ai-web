import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMemberByShortId, getAttendanceRecord, markAttendance } from '../services/firestoreService';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const CheckIn = () => {
  const { gymId } = useParams();
  const [shortId, setShortId] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error, expired, duplicate
  const [message, setMessage] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!shortId.trim()) return;

    setStatus('loading');
    try {
      // 1. Fetch Member
      const member = await getMemberByShortId(gymId, shortId.trim().toUpperCase());
      if (!member) {
        setStatus('error');
        setMessage('Member not found. Check your ID.');
        return;
      }

      // 2. Check Expiry
      const endDate = member.membershipEndDate;
      if (endDate && new Date(endDate) < new Date(todayStr)) {
        setStatus('expired');
        setMessage('Membership Expired. Contact Gym Owner.');
        return;
      }

      // 3. Check Duplicate
      const isMarked = await getAttendanceRecord(gymId, todayStr, member.id);
      if (isMarked) {
        setStatus('duplicate');
        setMessage('Attendance Already Marked Today!');
        return;
      }

      // 4. Mark Attendance
      await markAttendance(gymId, todayStr, member.id, member.memberName);
      
      setStatus('success');
      setMessage(`Welcome, ${member.memberName}! Attendance Marked.`);
      
      // Reset input for next person
      setTimeout(() => {
        setShortId('');
        setStatus('idle');
        setMessage('');
      }, 5000);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Error marking attendance. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', background: 'var(--bg)', position: 'relative', overflow: 'hidden'
    }}>
      {/* BG Image */}
      <div style={{
         position: 'absolute', inset: 0,
         backgroundImage: 'url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop")',
         backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2, mixBlendMode: 'screen'
      }} />

      <div className="card-glass-blue" style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px',
        padding: '40px 30px', borderRadius: '24px', textAlign: 'center',
        border: '1px solid rgba(99,102,241,0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.1)'
      }}>
        
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏋️</div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', marginBottom: '8px' }}>Gym Check-In</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '30px' }}>
          Enter your unique Member ID to mark attendance for today.
        </p>

        {status === 'idle' || status === 'loading' ? (
          <form onSubmit={handleCheckIn}>
            <input
              type="text"
              placeholder="e.g. RSGYM-1023"
              value={shortId}
              onChange={(e) => setShortId(e.target.value.toUpperCase())}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '2px',
                marginBottom: '20px', textTransform: 'uppercase'
              }}
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #06d6a0 0%, #04b285 100%)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 800, border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(6,214,160,0.4)', opacity: status === 'loading' ? 0.7 : 1
              }}
            >
              {status === 'loading' ? 'Checking...' : 'MARK ATTENDANCE'}
            </button>
          </form>
        ) : (
          <div className="animate-fade-in" style={{ padding: '20px 0' }}>
            {status === 'success' && <CheckCircle size={60} color="#06d6a0" style={{ margin: '0 auto 16px' }} />}
            {status === 'expired' && <AlertTriangle size={60} color="#f59e0b" style={{ margin: '0 auto 16px' }} />}
            {status === 'duplicate' && <CheckCircle size={60} color="#6366f1" style={{ margin: '0 auto 16px' }} />}
            {status === 'error' && <XCircle size={60} color="#f43f5e" style={{ margin: '0 auto 16px' }} />}
            
            <h2 style={{
              fontSize: '1.3rem', fontWeight: 800,
              color: status === 'success' ? '#06d6a0' : status === 'expired' ? '#f59e0b' : status === 'duplicate' ? '#6366f1' : '#f43f5e'
            }}>
              {message}
            </h2>
            
            <button
              onClick={() => setStatus('idle')}
              style={{
                marginTop: '30px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                padding: '10px 20px', borderRadius: '8px', color: 'var(--text-2)', cursor: 'pointer'
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
