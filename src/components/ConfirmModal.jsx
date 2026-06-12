import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', isDestructive = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-up" style={{ zIndex: 1000 }}>
      <div className="modal-panel" style={{ maxWidth: '400px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: isDestructive ? 'var(--error-bg)' : 'rgba(124, 92, 255, 0.1)',
            color: isDestructive ? 'var(--error)' : 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: `1px solid ${isDestructive ? 'var(--error-border)' : 'rgba(124, 92, 255, 0.25)'}`
          }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontFamily: 'var(--font-head)' }}>{title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: '24px' }}>{message}</p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }}>
                Cancel
              </button>
              <button 
                className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`} 
                onClick={() => { onConfirm(); onCancel(); }}
                style={{ flex: 1 }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
