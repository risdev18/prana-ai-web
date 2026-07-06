import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

const TrialLock = ({ children, featureName = "This feature", customAction }) => {
  const { gymData } = useAuth();

  if (gymData?.status !== 'trial') {
    return <>{children}</>;
  }

  const adminPhone = '919649011021'; 
  const waLink = `https://wa.me/${adminPhone}?text=Hi, I would like to upgrade my Vyronix account to the full version to unlock ${encodeURIComponent(featureName)}.`;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
      {/* Blurred out content */}
      <div style={{ filter: 'blur(4px)', opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>

      {/* Lock Overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(8, 6, 20, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 10,
        textAlign: 'center',
        padding: '24px'
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'rgba(255, 176, 32, 0.1)', border: '1px solid rgba(255, 176, 32, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--gold)', marginBottom: '12px',
          boxShadow: '0 0 20px rgba(255, 176, 32, 0.2)'
        }}>
          <Lock size={20} />
        </div>
        <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '16px' }}>Premium Feature</h4>
        <p style={{ color: 'var(--text-3)', fontSize: '13px', marginBottom: '16px', maxWidth: '280px' }}>
          {featureName} is locked in Trial Mode. Upgrade to unlock full access.
        </p>
        <a 
          href={waLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary"
          style={{ 
            height: '36px', padding: '0 16px', fontSize: '13px', borderRadius: 'var(--radius-sm)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'
          }}
          onClick={customAction}
        >
          Activate Plan
        </a>
      </div>
    </div>
  );
};

export default TrialLock;
