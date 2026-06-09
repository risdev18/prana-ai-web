import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Wallet, CalendarCheck, TrendingUp, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers, subscribeToAttendance, getMemberStatus, subscribeToRecentActivity } from '../services/firestoreService';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (currentUser) {
      const unsubMembers = subscribeToMembers(currentUser.uid, setMembers);
      const unsubAttendance = subscribeToAttendance(currentUser.uid, todayStr, setAttendanceRecords);
      const unsubActivity = subscribeToRecentActivity(currentUser.uid, (data) => {
        setRecentActivities(data.slice(0, 5)); // Just take top 5
      });

      return () => {
        unsubMembers();
        unsubAttendance();
        unsubActivity();
      };
    }
  }, [currentUser, todayStr]);

  const activeMembers = members.filter(m => getMemberStatus(m.membershipEndDate) === 'Active').length;
  const expiringMembers = members.filter(m => getMemberStatus(m.membershipEndDate) === 'Expiring Soon');
  
  // Dummy revenue data for now until we build the financial engine fully
  const todayRevenue = 0; 

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

  const StatCard = ({ icon, label, value, trend, color }) => (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-head)', fontWeight: 800, marginTop: '8px', color: '#fff' }}>{value}</div>
        </div>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color
        }}>
          {icon}
        </div>
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '0.8rem', color: 'var(--success)' }}>
          <TrendingUp size={16} /> {trend}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: color }} />
    </div>
  );

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-head)', lineHeight: 1.2 }}>Overview</h1>
          <p style={{ color: 'var(--text-2)' }}>Welcome to your Smart Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/members')} className="btn btn-primary" style={{ padding: '10px 20px', width: 'auto' }}>
            + Add Member
          </button>
        </div>
      </div>

      {/* 4 Pillar Stats */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard icon={<Users size={24} />} label="Total Members" value={members.length} trend="+2 this week" color="#6366f1" />
        <StatCard icon={<Activity size={24} />} label="Active Memberships" value={activeMembers} color="#06d6a0" />
        <StatCard icon={<CalendarCheck size={24} />} label="Today's Attendance" value={attendanceRecords.length} color="#f59e0b" />
        <StatCard icon={<Wallet size={24} />} label="Today's Revenue" value={`₹${todayRevenue}`} color="#0891b2" />
      </div>

      <div className="grid-2" style={{ gap: '24px', gridTemplateColumns: '2fr 1fr' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Chart */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Member Growth (6 Months)</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthGrowthData}>
                  <defs>
                    <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0d0d1f', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: '#6366f1' }}
                  />
                  <Area type="monotone" dataKey="members" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recent Activity Feed */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Recent Activities</h3>
            </div>
            {recentActivities.length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>No recent activities found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActivities.map((act, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                    <div style={{ flex: 1, fontSize: '0.9rem' }}>{act.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Expiring Members Widget */}
          <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(244,63,94,0.05))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <AlertTriangle size={20} color="var(--gold)" />
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Expiring Soon</h3>
            </div>
            
            {expiringMembers.length === 0 ? (
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>No members expiring in the next 7 days.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {expiringMembers.slice(0, 5).map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.memberName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>Exp: {new Date(m.membershipEndDate).toLocaleDateString()}</div>
                    </div>
                    <button style={{ background: 'var(--gold)', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                      Renew
                    </button>
                  </div>
                ))}
              </div>
            )}
            {expiringMembers.length > 5 && (
              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--gold)', cursor: 'pointer' }}>
                View all {expiringMembers.length}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'space-between' }} onClick={() => navigate('/settings')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>📍 Print QR Code</span>
                <ChevronRight size={16} />
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: 'space-between' }} onClick={() => navigate('/assessments')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>🤖 Generate AI Plan</span>
                <ChevronRight size={16} />
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: 'space-between' }} onClick={() => navigate('/reports')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>💵 Record Payment</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
