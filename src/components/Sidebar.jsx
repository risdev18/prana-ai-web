import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, RefreshCw, Dumbbell,
  Settings, LogOut, Zap, UserPlus, ClipboardList, Activity,
  MessageSquare, ChevronRight, DollarSign, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { downloadGymBackupExcel } from '../utils/exportUtils';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon: Icon, label, badge, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 14px',
      borderRadius: 'var(--radius-md)',
      color: isActive ? '#fff' : 'var(--text-2)',
      background: isActive ? 'rgba(124, 92, 255, 0.12)' : 'transparent',
      textDecoration: 'none',
      fontWeight: isActive ? 600 : 500,
      fontSize: '13.5px',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      marginBottom: '2px',
      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
      boxShadow: isActive ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' : 'none',
    })}
    onMouseEnter={e => {
      if (!e.currentTarget.classList.contains('active')) {
        e.currentTarget.style.background = 'var(--bg-hover)';
        e.currentTarget.style.color = '#fff';
      }
    }}
    onMouseLeave={e => {
      if (!e.currentTarget.getAttribute('aria-current')) {
        e.currentTarget.style.background = '';
        e.currentTarget.style.color = '';
      }
    }}
  >
    <Icon size={16} style={{ flexShrink: 0, opacity: 0.95 }} />
    <span style={{ flex: 1 }}>{label}</span>
    {badge && (
      <span style={{
        background: 'linear-gradient(135deg, var(--error) 0%, #ff7b97 100%)',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 800,
        padding: '2px 8px',
        borderRadius: '999px',
        minWidth: '18px',
        textAlign: 'center',
        boxShadow: '0 0 10px rgba(255, 94, 126, 0.25)',
      }}>{badge}</span>
    )}
  </NavLink>
);

const NavSection = ({ label, children }) => (
  <div style={{ marginBottom: '22px' }}>
    <div style={{
      fontSize: '10px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: 'var(--text-3)',
      padding: '0 14px',
      marginBottom: '6px',
    }}>
      {label}
    </div>
    {children}
  </div>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, gymData, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      toast.success('Generating Auto-Backup before signing out...', { duration: 3000 });
      await downloadGymBackupExcel(gymData.gymId, gymData.gymName);
    } catch (err) {
      console.warn("Backup failed on logout", err);
    }
    try { await logout(); navigate('/login'); }
    catch (err) { console.error(err); }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{ background: 'rgba(7, 5, 20, 0.75)', borderRight: '1px solid var(--border)' }}>
      {/* Brand Header */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        borderBottom: '1px solid var(--border)',
        gap: '12px',
        flexShrink: 0,
        background: 'rgba(10, 8, 30, 0.2)',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--blue-neon) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 16px rgba(124, 92, 255, 0.35)',
        }}>
          <Zap size={16} color="#fff" />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontFamily: 'var(--font-head)',
            fontWeight: 800,
            fontSize: '14px',
            letterSpacing: '0.08em',
            color: '#fff',
            textShadow: '0 0 10px rgba(124, 92, 255, 0.1)',
          }}>
            VYRONIX
          </div>
          <div style={{
            fontSize: '11px', color: 'var(--text-2)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '170px',
            fontWeight: 500,
          }}>
            {gymData?.gymName || 'Gym Operations'}
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '20px 10px', overflowY: 'auto' }}>
        {hasPermission('superdashboard') ? (
          <>
            <NavSection label="Admin">
              <NavItem to="/superadmin" icon={LayoutDashboard} label="Admin Dashboard" onClick={onClose} />
              <NavItem to="/superadmin/gyms" icon={Users} label="Manage Gyms" onClick={onClose} />
              <NavItem to="/superadmin/tickets" icon={ShieldAlert} label="Global Tickets" onClick={onClose} />
              <NavItem to="/superadmin/settings" icon={Settings} label="Global Settings" onClick={onClose} />
            </NavSection>
          </>
        ) : (
          <>
            <NavSection label="Operations">
              {hasPermission('dashboard') && <NavItem to="/dashboard"  icon={LayoutDashboard} label="Dashboard" onClick={onClose} />}
              {hasPermission('members') && <NavItem to="/members"    icon={Users}           label="Members" onClick={onClose} />}
              {hasPermission('renewals') && <NavItem to="/renewals"   icon={RefreshCw}       label="Renewals" onClick={onClose} />}
              {hasPermission('attendance') && <NavItem to="/attendance" icon={CalendarCheck}   label="Attendance" onClick={onClose} />}
              {hasPermission('leads') && <NavItem to="/leads"      icon={UserPlus}        label="Leads" onClick={onClose} />}
              {hasPermission('queries') && <NavItem to="/queries"    icon={MessageSquare}   label="Queries" onClick={onClose} />}
            </NavSection>

            <NavSection label="Fitness Core">
              {hasPermission('workouts') && <NavItem to="/workouts"    icon={ClipboardList} label="Workouts" onClick={onClose} />}
              {hasPermission('assessments') && <NavItem to="/assessments" icon={Activity}      label="Assessments" onClick={onClose} />}
            </NavSection>

            <NavSection label="Management">
              {hasPermission('expenses') && <NavItem to="/expenses" icon={DollarSign} label="Expenses" onClick={onClose} />}
              {hasPermission('tickets') && <NavItem to="/tickets" icon={ShieldAlert} label="Tickets" onClick={onClose} />}
              {hasPermission('trainers') && <NavItem to="/trainers" icon={Dumbbell} label="Trainers" onClick={onClose} />}
              {hasPermission('settings') && <NavItem to="/settings" icon={Settings} label="Settings" onClick={onClose} />}
              <NavItem to="/app-support" icon={ShieldAlert} label="Contact Admin" onClick={onClose} />
            </NavSection>
          </>
        )}
      </nav>

      {/* Footer Mini Card */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'rgba(10, 8, 30, 0.2)' }}>
        

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
            background: 'transparent', border: 'none',
            color: 'var(--text-2)', fontSize: '13px', cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', fontFamily: 'var(--font)',
            fontWeight: 600,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--error-bg)';
            e.currentTarget.style.color = 'var(--error)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-2)';
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>

        {/* Powered By Watermark */}
        <div style={{ textAlign: 'center', marginTop: '16px', opacity: 0.6 }}>
          <p style={{ fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.05em', margin: 0 }}>
            Powered by <strong style={{ color: 'var(--primary-light)' }}>SaffarLabs Mitra</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
