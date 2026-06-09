import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, UserPlus, LogOut, FileText, TrendingUp, Dumbbell, ChevronRight, BarChart2, CheckCircle, Copy, MapPin, Navigation, Shield, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers, subscribeToAttendance, getGymLocation, updateGymLocation } from '../services/firestoreService';
import { getCurrentPosition } from '../core/geolocation';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import QRCode from 'react-qr-code';

const Dashboard = () => {
  const navigate = useNavigate();
  const { gymData, currentUser, logout } = useAuth();
  const [members, setMembers] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [attendanceDate, setAttendanceDate] = useState(todayStr);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showQR, setShowQR] = useState(false);

  // ─── Gym Location State ───
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [gymLat, setGymLat] = useState('');
  const [gymLng, setGymLng] = useState('');
  const [allowedRadius, setAllowedRadius] = useState(100);
  const [locationSaved, setLocationSaved] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [fetchingGPS, setFetchingGPS] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsubscribeMembers = subscribeToMembers(currentUser.uid, (data) => {
        setMembers(data);
        setRecentMembers(data.slice(0, 3));
      });
      const unsubscribeAttendance = subscribeToAttendance(currentUser.uid, attendanceDate, (data) => {
        setAttendanceRecords(data);
      });

      // Load existing gym location
      getGymLocation(currentUser.uid).then(loc => {
        if (loc) {
          setGymLat(String(loc.gymLat));
          setGymLng(String(loc.gymLng));
          setAllowedRadius(loc.allowedRadius);
          setLocationSaved(true);
        }
      }).catch(console.error);

      return () => {
        unsubscribeMembers();
        unsubscribeAttendance();
      };
    }
  }, [currentUser, attendanceDate]);

  if (!gymData) return (
    <div className="loader"><div className="spinner" /></div>
  );

  const totalMembers = members.length;
  const dietPlansIssued = members.filter(m => m.goal).length;
  const pendingRenewals = 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = members.filter(m => {
    const d = new Date(m.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // --- Build chart data ---
  // Member Growth: members joined per month (last 6 months)
  const monthGrowthData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      const count = members.filter(m => {
        const md = new Date(m.createdAt);
        return md.getMonth() === d.getMonth() && md.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: label, members: count });
    }
    return months;
  })();

  // Goal distribution
  const goalCounts = members.reduce((acc, m) => {
    const g = m.goal || 'Other';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const goalData = Object.entries(goalCounts).map(([name, value]) => ({ name, value }));
  const GOAL_COLORS = ['#6366f1', '#06d6a0', '#f59e0b', '#f43f5e'];

  // BMI distribution
  const bmiData = [
    { label: 'Underweight', count: members.filter(m => m.bmi && m.bmi < 18.5).length, color: '#06b6d4' },
    { label: 'Normal',      count: members.filter(m => m.bmi && m.bmi >= 18.5 && m.bmi < 25).length, color: '#06d6a0' },
    { label: 'Overweight',  count: members.filter(m => m.bmi && m.bmi >= 25 && m.bmi < 30).length, color: '#f59e0b' },
    { label: 'Obese',       count: members.filter(m => m.bmi && m.bmi >= 30).length, color: '#f43f5e' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // ─── Location Handlers ───
  const handleUseCurrentLocation = async () => {
    setFetchingGPS(true);
    setLocationError('');
    try {
      const pos = await getCurrentPosition();
      setGymLat(String(pos.latitude));
      setGymLng(String(pos.longitude));
      setLocationError('');
    } catch (err) {
      const msg = err?.message || '';
      if (msg === 'GEOLOCATION_DENIED') {
        setLocationError('Location permission denied. Please allow GPS access.');
      } else if (msg === 'GEOLOCATION_UNSUPPORTED') {
        setLocationError('GPS not supported in this browser.');
      } else {
        setLocationError('Could not get location. Try again.');
      }
    } finally {
      setFetchingGPS(false);
    }
  };

  const handleSaveLocation = async () => {
    const lat = parseFloat(gymLat);
    const lng = parseFloat(gymLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setLocationError('Please enter valid coordinates.');
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    try {
      await updateGymLocation(currentUser.uid, {
        gymLat: lat,
        gymLng: lng,
        allowedRadius: allowedRadius,
      });
      setLocationSaved(true);
      setTimeout(() => setShowLocationModal(false), 1200);
    } catch (err) {
      console.error(err);
      setLocationError('Failed to save. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const getBmiColor = (bmi) => {
    if (!bmi) return '#6366f1';
    if (bmi < 18.5) return '#06b6d4';
    if (bmi < 25) return '#06d6a0';
    if (bmi < 30) return '#f59e0b';
    return '#f43f5e';
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div style={{ minHeight: '100vh', padding: '0 20px 40px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* NAVBAR */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 0', marginBottom: '8px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Dumbbell size={20} color="#fff" />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-head)', fontWeight: 900,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>PRANA AI</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '-2px' }}>
                Gym Management
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
              color: 'var(--error)', padding: '8px 14px', borderRadius: '8px',
              cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.85rem', fontWeight: 600
            }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>

        {/* WELCOME HERO */}
        <div style={{
          backgroundImage: 'linear-gradient(135deg, rgba(9,9,14,0.9) 0%, rgba(99,102,241,0.6) 100%), url("https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: '20px',
          padding: '36px 32px',
          margin: '24px 0',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            position: 'absolute', right: '-20px', top: '-20px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>
                Welcome back 👋
              </p>
              <h1 style={{
                fontSize: '1.8rem', fontFamily: 'var(--font-head)',
                background: 'linear-gradient(135deg, #fff 40%, #818cf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '4px'
              }}>
                {gymData.gymName}
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
                Owner: <strong style={{ color: 'var(--text)' }}>{gymData.ownerName}</strong>
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '12px 20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: 'var(--accent)' }}>
                {totalMembers}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '2px' }}>Total Members</div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid-4 mb-4" style={{ gap: '14px' }}>
          {[
            {
              icon: <Users size={22} />, value: totalMembers, label: 'Members',
              color: '#6366f1', bg: 'rgba(99,102,241,0.2)', cardClass: 'card-glass-blue'
            },
            {
              icon: <Activity size={22} />, value: dietPlansIssued, label: 'Plans Issued',
              color: '#06d6a0', bg: 'rgba(6,214,160,0.2)', cardClass: 'card-glass-green'
            },
            {
              icon: <UserPlus size={22} />, value: newThisMonth, label: 'New This Month',
              color: '#f59e0b', bg: 'rgba(245,158,11,0.2)', cardClass: 'card-glass-gold'
            },
            {
              icon: <TrendingUp size={22} />, value: pendingRenewals, label: 'Pending Renewals',
              color: '#f43f5e', bg: 'rgba(244,63,94,0.2)', cardClass: 'card-glass-pink'
            },
          ].map((s, i) => (
            <div key={i} className={`stat-card ${s.cardClass}`} style={{ borderTop: `4px solid ${s.color}` }}>
              <div className="stat-icon" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div className="stat-value" style={{ color: s.color, filter: `drop-shadow(0 0 10px ${s.color}80)` }}>{s.value}</div>
              <div className="stat-label" style={{ color: '#fff' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <h2 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          Quick Actions & Access
        </h2>
        
        {/* CHECK-IN LINK BUTTON */}
        <div style={{ marginBottom: '14px' }}>
          <button
            onClick={() => setShowQR(true)}
            style={{
              width: '100%', padding: '16px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1px dashed rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
            }}
          >
            <Copy size={18} /> View & Print Gym Check-In QR
          </button>
        </div>

        {/* GYM LOCATION SETTINGS BUTTON */}
        <div style={{ marginBottom: '14px' }}>
          <button
            onClick={() => setShowLocationModal(true)}
            style={{
              width: '100%', padding: '16px', borderRadius: '16px',
              background: locationSaved
                ? 'linear-gradient(135deg, rgba(6,214,160,0.15) 0%, rgba(6,214,160,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)',
              border: `1px dashed ${locationSaved ? 'rgba(6,214,160,0.4)' : 'rgba(245,158,11,0.4)'}`,
              color: '#fff', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
            }}
          >
            <MapPin size={18} color={locationSaved ? '#06d6a0' : '#f59e0b'} />
            {locationSaved ? '📍 Gym Location Set ✓' : '⚠️ Set Gym Location (Anti-Cheat)'}
          </button>
        </div>

        <div className="grid-2 mb-4" style={{ gap: '14px' }}>
          <button
            onClick={() => navigate('/add-member')}
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.05) 100%)',
              border: '1px solid rgba(99,102,241,0.5)',
              borderRadius: '20px', padding: '24px',
              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              display: 'flex', alignItems: 'center', gap: '16px',
              textAlign: 'left', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.1) 100%)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.05) 100%)'; }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 8px 24px rgba(99,102,241,0.5)'
            }}>
              <UserPlus size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: '#fff', fontSize: '1.2rem' }}>Add Member</div>
              <div style={{ color: 'var(--primary-light)', fontSize: '0.85rem', marginTop: '2px' }}>Register new gym member</div>
            </div>
            <ChevronRight size={24} color="var(--primary-light)" style={{ marginLeft: 'auto' }} />
          </button>

          <button
            onClick={() => navigate('/members')}
            style={{
              background: 'linear-gradient(135deg, rgba(6,214,160,0.2) 0%, rgba(8,145,178,0.05) 100%)',
              border: '1px solid rgba(6,214,160,0.5)',
              borderRadius: '20px', padding: '24px',
              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              display: 'flex', alignItems: 'center', gap: '16px',
              textAlign: 'left', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(6,214,160,0.4)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,214,160,0.3) 0%, rgba(8,145,178,0.1) 100%)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,214,160,0.2) 0%, rgba(8,145,178,0.05) 100%)'; }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #06d6a0, #0891b2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 8px 24px rgba(6,214,160,0.5)'
            }}>
              <Users size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: '#fff', fontSize: '1.2rem' }}>Members List</div>
              <div style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '2px' }}>View & manage all members</div>
            </div>
            <ChevronRight size={24} color="#06d6a0" style={{ marginLeft: 'auto' }} />
          </button>
        </div>

        {/* ATTENDANCE SECTION */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.5) 100%)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '28px', marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle color="#06d6a0" /> Daily Attendance Logs
            </h2>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer'
              }}
            />
          </div>

          {/* Summary Row */}
          {members.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.3)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#06d6a0' }}>
                  {attendanceRecords.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '2px' }}>Present</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f43f5e' }}>
                  {members.length - attendanceRecords.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '2px' }}>Absent</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6366f1' }}>
                  {members.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '2px' }}>Total</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {members.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '30px 0' }}>
                No members added yet.
              </div>
            ) : (
              members.map((member) => {
                const record = attendanceRecords.find(r => r.memberId === member.memberId);
                const isPresent = !!record;
                const checkInTime = record?.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
                const checkOutTime = record?.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

                return (
                  <div key={member.memberId} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isPresent ? 'rgba(6,214,160,0.05)' : 'rgba(244,63,94,0.04)',
                    padding: '16px 20px', borderRadius: '12px',
                    borderLeft: `4px solid ${isPresent ? '#06d6a0' : '#f43f5e'}`
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{isPresent ? '✅' : '❌'}</span>
                        <span>{member.memberName}</span>
                        {member.shortId && <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', background: 'rgba(255,255,255,0.07)', padding: '2px 7px', borderRadius: '6px' }}>{member.shortId}</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '3px' }}>
                        {isPresent ? (record.status === 'Completed' ? 'Session Completed ✓' : 'Currently In Gym') : 'Absent Today'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      {isPresent ? (
                        <>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In / Out</div>
                          <div style={{ fontWeight: 800, color: '#06d6a0', fontFamily: 'var(--font-head)', fontSize: '0.9rem' }}>
                            {checkInTime}
                          </div>
                          <div style={{ fontWeight: 800, color: '#6366f1', fontFamily: 'var(--font-head)', fontSize: '0.9rem' }}>
                            {checkOutTime || '—'}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: '#f43f5e', fontWeight: 700 }}>Absent</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ═══════════════ ANALYTICS SECTION ═══════════════ */}
        {members.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #f72585, #7209b7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <BarChart2 size={18} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Gym Analytics</h2>
            </div>

            {/* Member Growth Chart */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '20px', padding: '24px', marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>📈 Member Growth</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Members joined in the last 6 months</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#fff' }}
                    labelStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="members" stroke="#6366f1" strokeWidth={3} fill="url(#memberGrad)" dot={{ fill: '#6366f1', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Goal & BMI Charts row */}
            <div className="grid-2" style={{ gap: '16px' }}>

              {/* Goal Distribution */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(6,214,160,0.25)',
                borderRadius: '20px', padding: '24px'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>🎯 Goal Split</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginBottom: '16px' }}>Member fitness goals</div>
                {goalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={goalData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                        {goalData.map((_, i) => <Cell key={i} fill={GOAL_COLORS[i % GOAL_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
                      <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: '0.85rem' }}>No goal data yet</div>
                )}
              </div>

              {/* BMI Distribution */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '20px', padding: '24px'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>⚖️ BMI Health Map</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginBottom: '16px' }}>Member BMI categories</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={bmiData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {bmiData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* RECENT MEMBERS */}
        {recentMembers.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Members</h3>
              <span
                onClick={() => navigate('/members')}
                style={{ color: 'var(--primary-light)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                View all →
              </span>
            </div>
            {recentMembers.map(m => (
              <div key={m.id} className="member-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="member-avatar" style={{ background: `linear-gradient(135deg, ${getBmiColor(m.bmi)}, #6366f1)` }}>
                    {getInitials(m.memberName)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.memberName}</div>
                    <div style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>
                      {m.goal} • BMI: <span style={{ color: getBmiColor(m.bmi) }}>{m.bmi?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/members')}
                  style={{
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    color: 'var(--primary-light)', padding: '6px 12px', borderRadius: '8px',
                    cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.8rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <FileText size={14} /> View
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* QR CODE MODAL */}
      {showQR && (
        <div
          onClick={() => setShowQR(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', padding: '40px', borderRadius: '24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
          >
            <h2 style={{ color: '#000', marginBottom: '8px', fontSize: '1.5rem', fontFamily: 'var(--font-head)' }}>Scan to Check In</h2>
            <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center' }}>{gymData.gymName}</p>
            
            <QRCode
              value={`${window.location.origin}/checkin/${currentUser.uid}`}
              size={256}
              level="H"
            />
            
            <button
              onClick={() => window.print()}
              style={{
                marginTop: '30px', padding: '12px 24px', borderRadius: '8px',
                background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '1rem'
              }}
            >
              Print QR Code
            </button>
          </div>
        </div>
      )}

      {/* GYM LOCATION SETTINGS MODAL */}
      {showLocationModal && (
        <div
          onClick={() => setShowLocationModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #0f1729 0%, #1a1040 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
              padding: '36px 32px', borderRadius: '24px',
              width: '100%', maxWidth: '440px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.1)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)'
              }}>
                <MapPin size={22} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)', color: '#fff', margin: 0 }}>
                  Gym Location
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: 0 }}>GPS anti-cheat protection</p>
              </div>
            </div>

            {/* Status Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '12px', marginBottom: '20px',
              background: locationSaved ? 'rgba(6,214,160,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${locationSaved ? 'rgba(6,214,160,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}>
              <Shield size={16} color={locationSaved ? '#06d6a0' : '#f59e0b'} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: locationSaved ? '#06d6a0' : '#f59e0b' }}>
                {locationSaved ? 'Location configured — GPS verification active' : 'Not set — members can check in from anywhere'}
              </span>
            </div>

            {/* Use Current Location Button */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={fetchingGPS}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', marginBottom: '16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff', border: 'none', cursor: fetchingGPS ? 'wait' : 'pointer',
                fontSize: '0.95rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                opacity: fetchingGPS ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {fetchingGPS ? (
                <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Getting GPS...</>
              ) : (
                <><Navigation size={18} /> Use My Current Location</>
              )}
            </button>

            <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.75rem', marginBottom: '16px' }}>
              — or enter coordinates manually —
            </div>

            {/* Manual Lat/Lng Inputs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: '6px', fontWeight: 600 }}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 18.5204"
                  value={gymLat}
                  onChange={e => setGymLat(e.target.value)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: '6px', fontWeight: 600 }}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 73.8567"
                  value={gymLng}
                  onChange={e => setGymLng(e.target.value)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Radius Slider */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontWeight: 600 }}>Allowed Radius</label>
                <span style={{
                  fontSize: '0.85rem', fontWeight: 800, color: '#6366f1',
                  background: 'rgba(99,102,241,0.15)', padding: '2px 10px', borderRadius: '6px'
                }}>{allowedRadius}m</span>
              </div>
              <input
                type="range"
                min="50" max="500" step="10"
                value={allowedRadius}
                onChange={e => setAllowedRadius(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>50m (strict)</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>500m (relaxed)</span>
              </div>
            </div>

            {/* Error Message */}
            {locationError && (
              <div style={{
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
                borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
                color: '#f43f5e', fontSize: '0.85rem'
              }}>
                ⚠️ {locationError}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveLocation}
              disabled={locationLoading || !gymLat || !gymLng}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                background: locationLoading || !gymLat || !gymLng
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, #06d6a0 0%, #04b285 100%)',
                color: '#fff', border: 'none',
                cursor: locationLoading || !gymLat || !gymLng ? 'not-allowed' : 'pointer',
                fontSize: '1rem', fontWeight: 800,
                boxShadow: !gymLat || !gymLng ? 'none' : '0 4px 16px rgba(6,214,160,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {locationLoading ? (
                <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
              ) : (
                <><Shield size={18} /> Save Gym Location</>
              )}
            </button>

            {/* Info Note */}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', textAlign: 'center', marginTop: '14px', lineHeight: 1.5 }}>
              💡 Stand at your gym and tap "Use My Current Location" for best results.
              Members must be within the radius to check in.
            </p>
          </div>
        </div>
      )}

      {/* Inline keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
