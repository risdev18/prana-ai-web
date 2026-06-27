import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Users, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div style={{
    background: 'var(--bg-card)', padding: '24px', borderRadius: '20px',
    border: '1px solid var(--border)', flex: '1 1 200px', minWidth: '200px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        background: `rgba(${color}, 0.15)`, color: `rgb(${color})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={{ color: 'var(--text-3)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
        <div style={{ color: '#fff', fontSize: '28px', fontWeight: 800 }}>{value}</div>
      </div>
    </div>
  </div>
);

const SuperDashboard = () => {
  const [stats, setStats] = useState({
    totalGyms: 0,
    pendingGyms: 0,
    activeGyms: 0,
    totalTickets: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const gymsQuery = await getDocs(collection(db, 'Gyms'));
        let total = 0, pending = 0, active = 0;
        gymsQuery.forEach(doc => {
          total++;
          if (doc.data().status === 'pending') pending++;
          else active++;
        });

        const ticketsQuery = await getDocs(collection(db, 'GlobalTickets'));
        const tickets = ticketsQuery.size;

        setStats({ totalGyms: total, pendingGyms: pending, activeGyms: active, totalTickets: tickets });
      } catch (err) {
        console.error("Failed to fetch superadmin stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ margin: 0 }}>Super Admin Dashboard</h2>
        <p style={{ margin: 0, color: 'var(--text-3)' }}>Overview of all registered gyms and system health</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard icon={Users} title="Total Gyms" value={stats.totalGyms} color="124, 92, 255" />
        <StatCard icon={CheckCircle} title="Active Gyms" value={stats.activeGyms} color="0, 230, 118" />
        <StatCard icon={Clock} title="Pending Approvals" value={stats.pendingGyms} color="255, 171, 0" />
        <StatCard icon={ShieldAlert} title="Support Tickets" value={stats.totalTickets} color="255, 94, 126" />
      </div>
    </div>
  );
};

export default SuperDashboard;
