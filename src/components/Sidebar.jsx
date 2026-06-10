import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, RefreshCw, Dumbbell, Settings, LogOut, Zap, UserPlus, ClipboardList } from 'lucide-react';
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
    { name: 'Renewals', path: '/renewals', icon: RefreshCw },
    { name: 'Leads', path: '/leads', icon: UserPlus },
    { name: 'Trainers', path: '/trainers', icon: Dumbbell },
    { name: 'Workouts', path: '/workouts', icon: ClipboardList },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="sidebar">
      {/* Brand Header */}
      <div style={{
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid var(--border)',
        gap: '12px'
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Zap size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '0.02em' }}>
            PRANA AI
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
            {gymData?.gymName || 'Gym Management'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '8px' }}>
          Menu
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? '#fff' : 'var(--text-2)',
              background: isActive ? 'var(--primary)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
              fontSize: '14px',
              transition: 'all 0.2s ease'
            })}
          >
            <item.icon size={20} style={{ color: 'inherit' }} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          className="btn btn-ghost w-full justify-start"
          style={{ color: 'var(--error)' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
