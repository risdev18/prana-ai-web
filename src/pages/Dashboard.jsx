import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, UserPlus, LogOut, FileText, TrendingUp, Dumbbell, ChevronRight, BarChart2, CheckCircle, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers, subscribeToAttendance } from '../services/firestoreService';
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

  useEffect(() => {
    if (currentUser) {
      const unsubscribeMembers = subscribeToMembers(currentUser.uid, (data) => {
        setMembers(data);
        setRecentMembers(data.slice(0, 3));
      });
      const unsubscribeAttendance = subscribeToAttendance(currentUser.uid, attendanceDate, (data) => {
        setAttendanceRecords(data);
      });
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

          {attendanceRecords.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '30px 0' }}>
              No attendance marked for this date.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {attendanceRecords.map((record) => {
                const checkInTime = new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={record.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '12px',
                    borderLeft: '4px solid #06d6a0'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{record.memberName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '2px' }}>Member ID: {record.memberId.slice(0,8)}...</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Checked In</div>
                      <div style={{ fontWeight: 800, color: '#06d6a0', fontFamily: 'var(--font-head)' }}>{checkInTime}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
    </div>
  );
};

export default Dashboard;
