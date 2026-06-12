import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Clock, CalendarCheck, UserPlus, CheckCircle,
  MessageCircle, Scan, RefreshCw, Users, ArrowRight, Zap, TrendingDown,
  Activity as ActivityIcon, DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers, subscribeToAttendance, markAttendance, addEnquiry, subscribeToTransactions, subscribeToRecentActivity } from '../services/firestoreService';
import MemberProfileModal from '../components/MemberProfileModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, gymData } = useAuth();

  const [members, setMembers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [checkInId, setCheckInId] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinLoading, setWalkinLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  const [transactions, setTransactions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const u1 = subscribeToMembers(currentUser.uid, setMembers);
    const u2 = subscribeToAttendance(currentUser.uid, todayStr, setAttendanceRecords);
    const u3 = subscribeToTransactions(currentUser.uid, setTransactions);
    const u4 = subscribeToRecentActivity(currentUser.uid, setRecentActivity);
    return () => { u1(); u2(); u3(); u4(); };
  }, [currentUser, todayStr]);

  const today = new Date();

  const expiredMembers = members.filter(m =>
    m.membershipEndDate && new Date(m.membershipEndDate) < today
  );

  const expiringSoon = members.filter(m => {
    if (!m.membershipEndDate) return false;
    const diff = (new Date(m.membershipEndDate) - today) / 86400000;
    return diff >= 0 && diff <= 7;
  });

  const unpaidMembers = members.filter(m =>
    (m.membershipFee || 0) - (m.amountPaid || 0) > 0
  );

  const totalDues = unpaidMembers.reduce((sum, m) =>
    sum + ((m.membershipFee || 0) - (m.amountPaid || 0)), 0
  );

  // Build priority queue (max 8 items)
  const priorities = [];
  expiredMembers.slice(0, 3).forEach(m => {
    const bal = (m.membershipFee || 0) - (m.amountPaid || 0);
    priorities.push({ type: 'expired', member: m, bal });
  });
  expiringSoon.slice(0, 3).forEach(m => {
    const diff = Math.ceil((new Date(m.membershipEndDate) - today) / 86400000);
    const bal = (m.membershipFee || 0) - (m.amountPaid || 0);
    priorities.push({ type: 'expiring', member: m, bal, diff });
  });
  unpaidMembers.filter(m => !expiredMembers.includes(m)).slice(0, 2).forEach(m => {
    const bal = (m.membershipFee || 0) - (m.amountPaid || 0);
    priorities.push({ type: 'unpaid', member: m, bal });
  });

  const getWaLink = (p) => {
    const phone = p.member.phone?.replace(/\D/g, '');
    if (!phone) return '#';
    const fp = phone.length === 10 ? `91${phone}` : phone;
    const gym = gymData?.gymName || 'our gym';
    let txt = `Hi ${p.member.memberName}, message from *${gym}* 🏋️\n\n`;
    if (p.type === 'expired') txt += `⚠️ *Membership Expired*\nBalance due: ₹${p.bal}.\nPlease renew to continue.\n\nThank you!`;
    else if (p.type === 'expiring') txt += `📅 *Expiring in ${p.diff} day${p.diff !== 1 ? 's' : ''}*\nRenew early to avoid interruption.\n${p.bal > 0 ? `Balance: ₹${p.bal}.` : ''}\n\nThank you!`;
    else txt += `💸 *Pending Dues: ₹${p.bal}*\nKindly clear your outstanding balance.\n\nThank you!`;
    return `https://wa.me/${fp}?text=${encodeURIComponent(txt)}`;
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!checkInId.trim()) return;
    setCheckInLoading(true);
    try {
      const match = members.find(m => m.shortId?.toUpperCase() === checkInId.trim().toUpperCase());
      if (!match) { toast.error('Member ID not found.'); return; }
      if (new Date(match.membershipEndDate) < today) {
        toast.error(`${match.memberName}'s membership expired.`);
        return;
      }
      await markAttendance(currentUser.uid, todayStr, match.memberId, match.memberName);
      toast.success(`Checked in: ${match.memberName}`);
      setCheckInId('');
    } catch { toast.error('Failed to mark check-in.'); }
    finally { setCheckInLoading(false); }
  };

  const handleWalkin = async (e) => {
    e.preventDefault();
    setWalkinLoading(true);
    try {
      await addEnquiry(currentUser.uid, {
        name: walkinName.trim(), phone: walkinPhone.trim(),
        status: 'New Inquiry', source: 'Walk-in', notes: []
      });
      setWalkinName(''); setWalkinPhone('');
      toast.success('Prospect added to CRM successfully!');
    } catch { toast.error('Failed to register.'); }
    finally { setWalkinLoading(false); }
  };

  // Generate real revenue chart data (last 7 days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayRev = transactions
      .filter(t => t.date === dStr || (t.createdAt && t.createdAt.startsWith(dStr)))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue: dayRev };
  });

  const BADGE = {
    expired:  { cls: 'badge-red',    label: 'Expired' },
    expiring: { cls: 'badge-gold',   label: 'Expiring' },
    unpaid:   { cls: 'badge-purple', label: 'Unpaid' },
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div className="page-header-left">
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>Gym Desk</h2>
          <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', animation: 'pulse-soft 2s infinite' }} />
            Operational dashboard &bull; {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowQrModal(true)}
            className="btn btn-primary"
            style={{ height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)' }}
          >
            <Scan size={15} /> Show Gym QR
          </button>
          <button
            onClick={() => navigate(`/checkin/${currentUser?.uid}`)}
            className="btn btn-outline"
            style={{ height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)' }}
          >
            Open Scanner
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4 mb-6" style={{ gap: '16px', marginBottom: '32px' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '60%', height: '12px', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ width: '40%', height: '32px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ width: '80%', height: '10px' }} />
                </div>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
              </div>
            </div>
          ))
        ) : (
          [
            { label: 'Total Members', value: members.length, color: 'var(--primary-light)', icon: <Users size={20} />, sub: 'Active directory' },
            { label: 'Expired', value: expiredMembers.length, color: 'var(--error)', icon: <AlertTriangle size={20} />, sub: 'Action required' },
            { label: 'Expiring (7d)', value: expiringSoon.length, color: 'var(--gold)', icon: <Clock size={20} />, sub: 'Renewals due' },
            { label: 'Checked In Today', value: attendanceRecords.length, color: 'var(--success)', icon: <CalendarCheck size={20} />, sub: 'Active attendance' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: '8px' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: 'var(--font-head)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '6px', fontWeight: 500 }}>
                    {s.sub}
                  </div>
                </div>
                <div style={{ color: s.color, background: `${s.color}15`, padding: '10px', borderRadius: '12px', border: `1px solid ${s.color}20` }}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dues Alert Banner */}
      {totalDues > 0 && (
        <div style={{
          background: 'rgba(255, 94, 126, 0.06)',
          border: '1px solid rgba(255, 94, 126, 0.15)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          gap: '16px',
          flexWrap: 'wrap',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--error-bg)', border: '1px solid var(--error-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)'
            }}>
              <TrendingDown size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--error)', fontSize: '15px', fontFamily: 'var(--font-head)' }}>
                ₹{totalDues.toLocaleString('en-IN')} Outstanding Dues
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '2px' }}>
                {unpaidMembers.length} member{unpaidMembers.length !== 1 ? 's' : ''} with pending payments to collect
              </div>
            </div>
          </div>
          <button
            className="btn"
            onClick={() => navigate('/renewals')}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 94, 126, 0.2) 0%, rgba(255, 94, 126, 0.1) 100%)',
              border: '1px solid rgba(255, 94, 126, 0.3)',
              color: '#fff',
              fontSize: '13px',
              height: '38px',
              padding: '0 16px',
            }}
          >
            <RefreshCw size={14} className="spin" style={{ marginRight: '6px' }} /> Manage Dues
          </button>
        </div>
      )}

      {/* Analytics & Real Charts (Minimal) */}
      <div className="grid-2 mb-6" style={{ gap: '32px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-head)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <DollarSign size={16} />
              </div>
              Revenue Trend (7 Days)
            </div>
          </div>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(15, 12, 38, 0.9)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: 'var(--accent)', fontWeight: 700 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', r: 4, strokeWidth: 2, stroke: '#070514' }} activeDot={{ r: 6, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-head)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124, 92, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                <ActivityIcon size={16} />
              </div>
              Recent Activity
            </div>
            <button onClick={() => navigate('/members')} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}>View Log</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {recentActivity.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>No recent activity to show.</div>
            ) : recentActivity.slice(0, 4).map((act, i) => (
              <div key={act.id || i} style={{ display: 'flex', gap: '14px', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border-2)' : 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-hover)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
                  {act.type === 'check_in' ? <CalendarCheck size={16} /> : act.type === 'payment' ? <DollarSign size={16} /> : <MessageCircle size={16} />}
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{act.title || act.description}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{new Date(act.timestamp || act.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid-2" style={{ gap: '32px', alignItems: 'start' }}>

        {/* Column 1: Action Queue */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="section-label" style={{ margin: 0 }}>Today's Action Queue</div>
            {priorities.length > 0 && (
              <button onClick={() => navigate('/renewals')} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 8px', height: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight size={13} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {priorities.length === 0 ? (
              <div className="empty-state" style={{ padding: '48px 24px' }}>
                <CheckCircle size={36} color="var(--success)" />
                <h3 style={{ marginTop: '14px' }}>All caught up!</h3>
                <p>No expired memberships or unpaid dues today.</p>
              </div>
            ) : priorities.map((p, i) => (
              <div
                key={i}
                className="priority-item"
                style={{
                  cursor: 'pointer',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onClick={() => setSelectedMember(p.member)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.35)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${BADGE[p.type].cls}`}>{BADGE[p.type].label}</span>
                    <span style={{ fontWeight: 700, fontSize: '14.5px', color: '#fff' }}>{p.member.memberName}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '6px' }}>{p.member.shortId}</span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.4 }}>
                  {p.type === 'expired' && <>Membership expired &bull; Collection amount <strong style={{ color: 'var(--error)' }}>₹{p.bal}</strong></>}
                  {p.type === 'expiring' && <>Expires in <strong>{p.diff} day{p.diff !== 1 ? 's' : ''}</strong> &bull; {p.bal > 0 ? <>Outstanding <strong style={{ color: 'var(--gold)' }}>₹{p.bal}</strong></> : 'Paid'}</>}
                  {p.type === 'unpaid' && <>Outstanding pending dues: <strong style={{ color: 'var(--error)' }}>₹{p.bal}</strong></>}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }} onClick={e => e.stopPropagation()}>
                  <a
                    href={getWaLink(p)} target="_blank" rel="noopener noreferrer"
                    className="btn"
                    style={{
                      background: '#128C7E',
                      color: '#fff',
                      fontSize: '12px',
                      height: '34px',
                      padding: '0 14px',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 2px 8px rgba(18, 140, 126, 0.2)'
                    }}
                    onClick={e => { if (!p.member.phone) { e.preventDefault(); alert('No phone number on profile.'); } }}
                  >
                    <MessageCircle size={13} /> WhatsApp
                  </a>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: '12px', height: '34px', padding: '0 14px', borderRadius: 'var(--radius-sm)' }}
                    onClick={() => navigate('/renewals')}
                  >
                    Collect / Renew
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Reception Panel */}
        <div>
          <div className="section-label" style={{ marginBottom: '16px' }}>Reception Desk</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Quick Check-in */}
            <div className="card" style={{ padding: '24px', background: 'rgba(15, 12, 38, 0.45)' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-head)' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
                Quick Check-In
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px', marginBottom: '16px' }}>Enter member ID to log attendance instantly</div>
              
              <form onSubmit={handleCheckIn} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text" className="form-control"
                  placeholder="Member ID (e.g. GYM-001)"
                  value={checkInId}
                  onChange={e => setCheckInId(e.target.value)}
                  style={{ flex: 1, fontSize: '13.5px', height: '42px' }}
                />
                <button
                  type="submit"
                  disabled={checkInLoading}
                  className="btn btn-primary"
                  style={{ height: '42px', padding: '0 18px', flexShrink: 0, borderRadius: 'var(--radius-sm)' }}
                >
                  {checkInLoading ? <RefreshCw size={14} className="spin" /> : <><Zap size={14} /> Go</>}
                </button>
              </form>
            </div>

            {/* Walk-in Lead */}
            <div className="card" style={{ padding: '24px', background: 'rgba(15, 12, 38, 0.45)' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-head)' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)' }} />
                Instant Walk-in
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px', marginBottom: '16px' }}>Capture new prospect enquiry details</div>
              
              <form onSubmit={handleWalkin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text" className="form-control"
                  placeholder="Enquirer Name" required
                  value={walkinName} onChange={e => setWalkinName(e.target.value)}
                  style={{ fontSize: '13px', height: '40px' }}
                />
                <input
                  type="tel" className="form-control"
                  placeholder="Phone number" required
                  value={walkinPhone} onChange={e => setWalkinPhone(e.target.value)}
                  style={{ fontSize: '13px', height: '40px' }}
                />
                <button
                  type="submit"
                  disabled={walkinLoading}
                  className="btn btn-outline w-full"
                  style={{ fontSize: '13px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <UserPlus size={14} style={{ color: 'var(--primary-light)' }} />
                  {walkinLoading ? <RefreshCw size={14} className="spin" /> : 'Register Walk-in'}
                </button>
              </form>
            </div>

            {/* Quick Navigation Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Add Member', icon: <UserPlus size={18} />, path: '/add-member', color: 'var(--primary-light)', bg: 'rgba(124, 92, 255, 0.08)' },
                { label: 'Attendance', icon: <CalendarCheck size={18} />, path: '/attendance', color: 'var(--success)', bg: 'rgba(0, 230, 118, 0.08)' },
                { label: 'Renewals', icon: <RefreshCw size={18} />, path: '/renewals', color: 'var(--gold)', bg: 'rgba(255, 208, 67, 0.08)' },
                { label: 'All Members', icon: <Users size={18} />, path: '/members', color: 'var(--accent)', bg: 'rgba(0, 212, 255, 0.08)' },
              ].map(a => (
                <button
                  key={a.label}
                  className="quick-action-btn"
                  onClick={() => navigate(a.path)}
                  style={{
                    background: a.bg,
                    borderColor: 'var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '16px 12px',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ color: a.color }}>{a.icon}</div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text)', fontWeight: 600 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Member Profile Modal */}
      {selectedMember && currentUser && (
        <MemberProfileModal
          member={selectedMember}
          gymId={currentUser.uid}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* QR Code Modal */}
      {showQrModal && currentUser && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal-panel" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: '1.2rem' }}>Gym Check-In QR</h3>
              <button onClick={() => setShowQrModal(false)} className="btn btn-ghost btn-icon">X</button>
            </div>
            
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}>
              <QRCode
                value={`${window.location.origin}/checkin/${currentUser.uid}`}
                size={220}
                level="H"
              />
            </div>
            
            <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '24px' }}>
              Members can scan this QR code to mark their attendance and enter their ID.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/checkin/${currentUser.uid}`);
                  toast.success('Link copied!');
                }}
              >
                Copy Link
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => window.open(`/checkin/${currentUser.uid}`, '_blank')}
              >
                Open Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
