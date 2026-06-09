import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TopBar = () => {
  const { gymData } = useAuth();

  return (
    <div style={{
      height: '80px',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(2, 2, 4, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Search Bar */}
      <div style={{ flex: 1, maxWidth: '400px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)'
          }} />
          <input
            type="text"
            placeholder="Search members, IDs, or phone..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
            }}
            onBlur={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button style={{
          position: 'relative',
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-2)', cursor: 'pointer', transition: 'all 0.2s ease'
        }}>
          <Bell size={20} />
          {/* Notification Badge */}
          <span style={{
            position: 'absolute', top: '0', right: '0',
            width: '10px', height: '10px', borderRadius: '50%',
            background: 'var(--error)', border: '2px solid #020204'
          }} />
        </button>

        {/* User Profile Snippet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #06d6a0, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: '#fff', fontSize: '0.9rem'
          }}>
            {gymData?.ownerName ? gymData.ownerName[0].toUpperCase() : 'O'}
          </div>
          <div style={{ display: 'none' /* hidden on mobile potentially */ }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{gymData?.ownerName || 'Owner'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
