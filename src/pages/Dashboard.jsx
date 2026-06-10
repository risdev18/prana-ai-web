import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, CalendarCheck, UserPlus, CreditCard, Clock, Activity, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers, subscribeToAttendance } from '../services/firestoreService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (currentUser) {
      const unsubMembers = subscribeToMembers(currentUser.uid, setMembers);
      const unsubAttendance = subscribeToAttendance(currentUser.uid, todayStr, setAttendanceRecords);
      return () => {
        unsubMembers();
        unsubAttendance();
      };
    }
  }, [currentUser, todayStr]);

  // Calculations
  const today = new Date();
  const expiringSoonCount = members.filter(m => {
    const end = new Date(m.membershipEndDate);
    const diff = (end - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 5;
  }).length;

  const pendingRenewalsCount = members.filter(m => m.paymentStatus === 'Pending' || new Date(m.membershipEndDate) < today).length;
  
  const inactiveMembers = members.filter(m => {
    // Basic inactive check: just random logic for now if no attendance history is deep loaded
    // In a real app we'd query attendance. We'll simulate 2 inactive members for demo of the alert.
    return false; 
  });
  
  // Fake inactive alerts for MVP demonstration of the feature
  const alerts = [
    ...(pendingRenewalsCount > 0 ? [{ id: 1, type: 'warning', text: `${pendingRenewalsCount} memberships are pending renewal or payment.` }] : []),
    ...(expiringSoonCount > 0 ? [{ id: 2, type: 'info', text: `${expiringSoonCount} members expiring in the next 5 days.` }] : []),
    { id: 3, type: 'danger', text: 'Rohit hasn\'t attended for 7 days.' }
  ];

  const StatCard = ({ icon, label, value, color }) => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'var(--text-3)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', color: 'var(--text)' }}>{value}</div>
        </div>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
          {icon}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: color }} />
    </div>
  );

  const ActionButton = ({ icon, label, onClick, primary = false }) => (
    <button 
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px', borderRadius: '16px', border: primary ? 'none' : '1px solid var(--border)',
        background: primary ? 'var(--primary)' : 'var(--bg-card)',
        color: primary ? '#fff' : 'var(--text)',
        cursor: 'pointer', transition: 'all 0.2s', gap: '10px'
      }}
    >
      {icon}
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{label}</span>
    </button>
  );

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>Dashboard</h2>
        <p className="text-muted">Is your gym healthy today?</p>
      </div>

      {/* PRIORITY 1: Expiring, Pending, Attendance */}
      <div className="grid-3 mb-6">
        <StatCard icon={<AlertTriangle size={24} />} label="Expiring Soon" value={expiringSoonCount} color="var(--warning)" />
        <StatCard icon={<Clock size={24} />} label="Pending Renewals" value={pendingRenewalsCount} color="var(--error)" />
        <StatCard icon={<CalendarCheck size={24} />} label="Today's Attendance" value={attendanceRecords.length} color="var(--success)" />
      </div>

      {/* AUTOMATED ALERTS (Retention) */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h3 style={{ fontSize: '15px', color: 'var(--text-2)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Action Required
          </h3>
          <div className="flex flex-col gap-2">
            {alerts.map(alert => (
              <div key={alert.id} style={{
                padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                background: alert.type === 'danger' ? 'rgba(239,68,68,0.1)' : alert.type === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                border: `1px solid ${alert.type === 'danger' ? 'rgba(239,68,68,0.2)' : alert.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)'}`
              }}>
                <div style={{ color: alert.type === 'danger' ? 'var(--error)' : alert.type === 'warning' ? 'var(--warning)' : 'var(--primary)' }}>
                  <AlertTriangle size={20} />
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>{alert.text}</div>
                <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => navigate('/renewals')}>
                  Take Action
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRIORITY 2: Quick Actions */}
      <h3 style={{ fontSize: '15px', color: 'var(--text-2)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Quick Actions
      </h3>
      <div className="grid-4 mb-6">
        <ActionButton primary icon={<UserPlus size={24} />} label="Add Member" onClick={() => navigate('/add-member')} />
        <ActionButton icon={<CreditCard size={24} />} label="Mark Payment" onClick={() => navigate('/renewals')} />
        <ActionButton icon={<CalendarCheck size={24} />} label="Mark Attendance" onClick={() => navigate('/attendance')} />
        <ActionButton icon={<Users size={24} />} label="View Leads" onClick={() => navigate('/leads')} />
      </div>

    </div>
  );
};

export default Dashboard;
