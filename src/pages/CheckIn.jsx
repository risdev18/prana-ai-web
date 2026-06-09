import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMemberByShortId, getAttendanceRecordFull, markAttendance, updateCheckOutTime, getGymLocation } from '../services/firestoreService';
import { verifyLocation, getLocationErrorMessage } from '../core/geolocation';
import { CheckCircle, XCircle, AlertTriangle, LogOut, MapPin, Navigation, Shield, Loader } from 'lucide-react';

const CheckIn = () => {
  const { gymId } = useParams();
  const [shortId, setShortId] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, locating, success, checkout, error, expired, done, denied-location, location-error
  const [message, setMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');
  const [gymLocation, setGymLocation] = useState(null); // { gymLat, gymLng, allowedRadius }
  const [locationLoaded, setLocationLoaded] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Load gym location on mount
  useEffect(() => {
    const loadGymLocation = async () => {
      try {
        const loc = await getGymLocation(gymId);
        setGymLocation(loc); // null if not configured
      } catch (err) {
        console.error('Failed to load gym location:', err);
      } finally {
        setLocationLoaded(true);
      }
    };
    loadGymLocation();
  }, [gymId]);

  const resetAfterDelay = (ms = 6000) => {
    setTimeout(() => {
      setShortId('');
      setStatus('idle');
      setMessage('');
      setSubMessage('');
    }, ms);
  };

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

      // 3. GPS Verification (only if gym location is configured)
      if (gymLocation) {
        setStatus('locating');
        setMessage('Verifying Location...');
        setSubMessage('Please allow GPS access when prompted.');

        try {
          const result = await verifyLocation(
            gymLocation.gymLat,
            gymLocation.gymLng,
            gymLocation.allowedRadius
          );

          if (!result.allowed) {
            setStatus('denied-location');
            setMessage('Too Far From Gym');
            setSubMessage(
              `You are ${result.distance >= 1000
                ? (result.distance / 1000).toFixed(1) + ' km'
                : result.distance + 'm'
              } away. Must be within ${gymLocation.allowedRadius}m.`
            );
            resetAfterDelay(8000);
            return;
          }
          // GPS passed — continue to attendance
        } catch (locError) {
          const errMsg = getLocationErrorMessage(locError);
          setStatus('location-error');
          setMessage(errMsg.title);
          setSubMessage(errMsg.detail);
          resetAfterDelay(8000);
          return;
        }
      }

      // 4. Get existing attendance record
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

      resetAfterDelay(6000);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Something went wrong');
      setSubMessage('Please try again in a moment.');
    }
  };

  const statusConfig = {
    success:          { color: '#06d6a0', icon: <CheckCircle size={64} color="#06d6a0" /> },
    checkout:         { color: '#6366f1', icon: <LogOut size={64} color="#6366f1" /> },
    expired:          { color: '#f59e0b', icon: <AlertTriangle size={64} color="#f59e0b" /> },
    done:             { color: '#6366f1', icon: <CheckCircle size={64} color="#6366f1" /> },
    error:            { color: '#f43f5e', icon: <XCircle size={64} color="#f43f5e" /> },
    'denied-location': { color: '#f43f5e', icon: <MapPin size={64} color="#f43f5e" /> },
    'location-error':  { color: '#f59e0b', icon: <Navigation size={64} color="#f59e0b" /> },
  };

  const isResultScreen = !['idle', 'loading', 'locating'].includes(status);

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

        {!isResultScreen ? (
          <>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🏋️</div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', marginBottom: '8px' }}>
              Gym Check-In
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Enter your Member ID to check in.<br />
              <span style={{ color: '#06d6a0', fontWeight: 600 }}>Scan again to check out.</span>
            </p>

            {/* GPS Protection Badge */}
            {locationLoaded && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px', marginBottom: '24px',
                background: gymLocation
                  ? 'rgba(6,214,160,0.1)'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${gymLocation
                  ? 'rgba(6,214,160,0.3)'
                  : 'rgba(255,255,255,0.1)'}`,
              }}>
                <Shield size={14} color={gymLocation ? '#06d6a0' : 'var(--text-3)'} />
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: gymLocation ? '#06d6a0' : 'var(--text-3)'
                }}>
                  {gymLocation ? 'GPS Verified Check-In' : 'Standard Check-In'}
                </span>
              </div>
            )}

            {/* Locating state overlay */}
            {status === 'locating' && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '16px', padding: '20px 0', marginBottom: '16px'
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(99,102,241,0.15)',
                  border: '2px solid rgba(99,102,241,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}>
                  <Navigation size={28} color="#6366f1" style={{ animation: 'spin 2s linear infinite' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#818cf8', marginBottom: '4px' }}>
                    📡 Verifying Location...
                  </p>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>
                    Please allow GPS access when prompted
                  </p>
                </div>
              </div>
            )}

            {status !== 'locating' && (
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
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Verifying...
                    </>
                  ) : (
                    'SUBMIT'
                  )}
                </button>
              </form>
            )}
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

            {/* Extra info for denied-location */}
            {status === 'denied-location' && (
              <div style={{
                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
                borderRadius: '12px', padding: '14px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <Shield size={20} color="#f43f5e" style={{ flexShrink: 0 }} />
                <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', textAlign: 'left', margin: 0 }}>
                  Attendance can only be marked when you are physically at the gym.
                  QR screenshots and remote access are not allowed.
                </p>
              </div>
            )}

            <button
              onClick={() => { setStatus('idle'); setShortId(''); setMessage(''); setSubMessage(''); }}
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

      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default CheckIn;
