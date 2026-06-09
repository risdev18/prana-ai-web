import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, FileBarChart, PieChart, Settings, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { logout, gymData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { name: 'Assessments', path: '/assessments', icon: FileBarChart },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'rgba(15, 15, 26, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      transition: 'all 0.3s ease'
    }}>
      {/* Brand Header */}
      <div style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        gap: '12px'
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(99,102,241,0.4)'
        }}>
          <Zap size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '0.02em' }}>
            PRANA AI
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
            {gymData?.gymName || 'Fitness Platform'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '8px' }}>
          Menu
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              color: isActive ? '#fff' : 'var(--text-2)',
              background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, transparent 100%)' : 'transparent',
              borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease'
            })}
          >
            <item.icon size={20} style={{ color: 'inherit' }} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px',
            background: 'rgba(244,63,94,0.05)',
            border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '12px',
            color: 'var(--error)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.05)'; }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
