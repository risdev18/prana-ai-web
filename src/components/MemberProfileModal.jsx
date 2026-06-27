import React, { useEffect, useState } from 'react';
import { X, Calendar, Activity, Medal, TrendingUp, AlertTriangle, Trash2, MessageCircle, RefreshCw } from 'lucide-react';
import { subscribeToMemberTimeline, deleteMember, logAudit } from '../services/firestoreService';
import ConfirmModal from './ConfirmModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MemberProfileModal = ({ member, gymId, gymData, onClose }) => {
  const [timeline, setTimeline] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  const getWhatsAppReminderLink = () => {
    const phone = member.phone?.replace(/\D/g, '');
    if (!phone) return '#';
    const fp = phone.length === 10 ? `91${phone}` : phone;
    const gymName = gymData?.gymName || 'our gym';
    const balance = (member.membershipFee || 0) - (member.amountPaid || 0);
    let text = `Hi ${member.memberName}, this is a reminder from ${gymName}. `;
    if (member.membershipEndDate) {
      text += `Your membership ends on ${new Date(member.membershipEndDate).toLocaleDateString()}. `;
    }
    if (balance > 0) {
      text += `You have a pending balance of ₹${balance}. `;
    }
    text += `Please contact us to renew. Thank you!`;
    return `https://wa.me/${fp}?text=${encodeURIComponent(text)}`;
  };

  useEffect(() => {
    if (member?.id && gymId) {
      const unsub = subscribeToMemberTimeline(gymId, member.id, setTimeline);
      return () => unsub();
    }
  }, [member?.id, gymId]);

  const handleDelete = async () => {
    try {
      await deleteMember(gymId, member.id);
      await logAudit(gymId, gymId, 'DELETE_MEMBER', `Deleted member: ${member.memberName} (${member.shortId || member.id})`);
      toast.success('Member profile deleted');
      onClose();
    } catch (err) {
      toast.error('Failed to delete member');
    }
  };

  if (!member) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '0'
    }}>
      <div style={{
        width: '100%', maxWidth: '500px', height: '100vh',
        background: 'var(--bg)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.2rem', color: '#fff'
            }}>
              {member.memberName?.[0] || '?'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)', lineHeight: 1.2 }}>{member.memberName}</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>ID: {member.shortId} • {member.phone}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {/* Status & Key Info */}
          <div className="grid-2" style={{ gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Status</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: member.status === 'Active' ? 'var(--success)' : member.status === 'Expiring Soon' ? 'var(--gold)' : 'var(--error)' }}>
                {member.status || 'Active'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '4px' }}>Expires: {new Date(member.membershipEndDate).toLocaleDateString()}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Fitness Goal</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                {member.goal || 'N/A'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '4px' }}>Target tracking active</div>
            </div>
          </div>

          {/* Quick Actions inside profile */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => { onClose(); navigate('/renewals'); }}
            >
              <RefreshCw size={15} /> Renew
            </button>
            {member.phone ? (
              <a
                href={getWhatsAppReminderLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', color: '#25D366', borderColor: '#25D366' }}
              >
                <MessageCircle size={15} /> Remind
              </a>
            ) : (
              <button className="btn btn-outline" style={{ flex: 1, padding: '10px' }} onClick={() => toast.error('No phone number on profile.')}>
                <MessageCircle size={15} /> Remind
              </button>
            )}
          </div>

          {/* Achievements (Stub) */}
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Medal size={18} color="var(--gold)" /> Achievements
          </h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto' }}>
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold)', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '1.2rem' }}>🔥</span> 10 Day Streak
            </div>
            <div style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.3)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '1.2rem' }}>📉</span> First Assessment
            </div>
          </div>

          {/* Activity Timeline */}
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--primary-light)" /> Activity Timeline
          </h3>
          
          <div style={{ position: 'relative', paddingLeft: '16px' }}>
            <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '2px', background: 'var(--border)' }} />
            
            {timeline.length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', paddingLeft: '24px' }}>No activity recorded yet.</p>
            ) : (
              timeline.map(event => (
                <div key={event.id} style={{ position: 'relative', paddingLeft: '32px', marginBottom: '24px' }}>
                  <div style={{
                    position: 'absolute', left: '0', top: '4px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: 'var(--primary)', border: '3px solid var(--bg)',
                    boxShadow: '0 0 0 2px var(--primary-light)'
                  }} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '4px' }}>
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{event.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginTop: '4px' }}>{event.description}</div>
                  </div>
                </div>
              ))
            )}
            
            {/* Joined Event (Base) */}
            <div style={{ position: 'relative', paddingLeft: '32px' }}>
              <div style={{
                position: 'absolute', left: '0', top: '4px',
                width: '10px', height: '10px', borderRadius: '50%',
                background: 'var(--text-3)', border: '3px solid var(--bg)'
              }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '4px' }}>
                {new Date(member.createdAt || member.membershipStartDate).toLocaleDateString()}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-2)' }}>Joined the gym</div>
            </div>
          </div>
          
          
          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn" 
              style={{ width: '100%', padding: '12px', background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Trash2 size={16} /> Delete Member Profile
            </button>
          </div>
          
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Member"
        message={`Are you sure you want to completely delete ${member.memberName}'s profile? This will erase all their attendance and payment data permanently.`}
        confirmText="Delete Member"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default MemberProfileModal;
