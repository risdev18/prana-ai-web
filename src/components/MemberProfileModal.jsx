import React, { useEffect, useState } from 'react';
import { X, Activity, Medal, Trash2, MessageCircle, RefreshCw, FileText, ClipboardList, ChevronRight } from 'lucide-react';
import { subscribeToMemberTimeline, deleteMember, logAudit } from '../services/firestoreService';
import { generateAssessment } from '../core/calculator';
import ConfirmModal from './ConfirmModal';
import ReceiptModal from './ReceiptModal';
import ExtendModal from './ExtendModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MemberProfileModal = ({ member, gymId, gymData, onClose }) => {
  const [timeline, setTimeline] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [receiptMember, setReceiptMember] = useState(null);
  const navigate = useNavigate();

  const getWhatsAppReminderLink = () => {
    const phone = member.phone?.replace(/\D/g, '');
    if (!phone) return '#';
    const fp = phone.length === 10 ? `91${phone}` : phone;
    const gymName = gymData?.gymName || 'our gym';
    const dateStr = member.membershipEndDate
      ? new Date(member.membershipEndDate).toLocaleDateString('en-GB')
      : 'N/A';
    const text =
      `🏋️‍♂️ Hi ${member.memberName},\n\n` +
      `Your membership at ${gymName} expired on ${dateStr}.\n\n` +
      `Renew your membership today to continue enjoying:\n` +
      `✅ Unlimited gym access\n` +
      `✅ Member benefits and support\n` +
      `✅ Uninterrupted fitness progress\n\n` +
      `📞 Contact us or visit the gym to renew now.\n\n` +
      `Thank you for being a part of the ${gymName} family!\n\n` +
      `Team ${gymName}`;
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
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 700,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: '420px', height: '100vh',
          background: 'linear-gradient(180deg, #0d0a21 0%, #070514 100%)',
          borderLeft: '1px solid rgba(124, 92, 255, 0.15)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Strip */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px 0' }}>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Hero Header */}
        <div style={{ padding: '16px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Avatar */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px', flexShrink: 0,
              background: member.photoUrl ? 'none' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.5rem', color: '#fff',
              overflow: 'hidden',
              border: '2px solid rgba(124, 92, 255, 0.3)',
              boxShadow: '0 8px 24px rgba(124, 92, 255, 0.25)',
            }}>
              {member.photoUrl
                ? <img src={member.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (member.memberName?.[0] || '?')}
            </div>

            {/* Name + ID + Phone */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{
                fontSize: '1.2rem', fontFamily: 'var(--font-head)', fontWeight: 700,
                margin: 0, lineHeight: 1.2, color: '#fff',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {member.memberName}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {member.shortId && (
                  <span style={{
                    background: 'rgba(124, 92, 255, 0.12)', color: 'var(--primary-light)',
                    border: '1px solid rgba(124, 92, 255, 0.25)', fontSize: '11px',
                    fontWeight: 600, padding: '2px 10px', borderRadius: '6px',
                    letterSpacing: '0.04em', whiteSpace: 'nowrap',
                  }}>
                    {member.shortId}
                  </span>
                )}
                {member.phone && (
                  <span style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 400, whiteSpace: 'nowrap' }}>
                    {member.phone}
                  </span>
                )}
              </div>
              {/* Status pill */}
              <div style={{ marginTop: '8px' }}>
                <span style={{
                  display: 'inline-block', fontSize: '10px', fontWeight: 600,
                  padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  background: member.status === 'Active'
                    ? 'rgba(0,230,118,0.1)' : member.status === 'Expiring Soon'
                    ? 'rgba(255,208,67,0.1)' : 'rgba(255,94,126,0.1)',
                  color: member.status === 'Active'
                    ? 'var(--success)' : member.status === 'Expiring Soon'
                    ? 'var(--gold)' : 'var(--error)',
                  border: `1px solid ${member.status === 'Active' ? 'rgba(0,230,118,0.25)' : member.status === 'Expiring Soon' ? 'rgba(255,208,67,0.25)' : 'rgba(255,94,126,0.25)'}`,
                }}>
                  {member.status || 'Active'} • Expires {member.membershipEndDate ? new Date(member.membershipEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1px', background: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            { label: 'Duration', value: `${member.membershipDuration || '—'} mo`, icon: '📅' },
            { label: 'Fee', value: `₹${(member.membershipFee || 0).toLocaleString('en-IN')}`, icon: '💰' },
            { label: 'Balance', value: `₹${((member.membershipFee || 0) - (member.amountPaid || 0)).toLocaleString('en-IN')}`, icon: '🧾' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(7,5,20,0.6)', padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Action List — Reference Style */}
        <div style={{ padding: '20px 0' }}>
          <div style={{ padding: '0 24px', marginBottom: '8px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)' }}>
            Manage Member
          </div>
          {[
            {
              icon: '🔄', label: 'Renew Membership', sub: 'Extend membership period',
              action: () => setIsExtendOpen(true),
            },
            {
              icon: '💬', label: 'Send WhatsApp Reminder', sub: 'Open in WhatsApp',
              href: getWhatsAppReminderLink(), target: '_blank',
            },
            {
              icon: '🧾', label: 'Print / View Receipt', sub: 'Payment receipt',
              action: () => { setReceiptMember(member); setIsReceiptOpen(true); },
            },
            {
              icon: '📊', label: 'BMI & Fitness Report', sub: 'View body assessment',
              action: () => {
                const a = generateAssessment(member);
                onClose();
                navigate('/assessment', { state: { assessment: a, isNew: false } });
              },
            },
          ].map((item, i) => {
            const content = (
              <>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px', fontWeight: 400 }}>{item.sub}</div>
                </div>
                <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
              </>
            );
            const rowStyle = {
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 24px', cursor: 'pointer', transition: 'background 0.15s',
              borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              textDecoration: 'none',
            };
            return item.href ? (
              <a key={i} href={item.href} target={item.target} rel="noopener noreferrer"
                style={rowStyle}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >{content}</a>
            ) : (
              <div key={i} style={rowStyle}
                onClick={item.action}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >{content}</div>
            );
          })}
        </div>

        {/* Fitness Profile */}
        <div style={{ padding: '8px 24px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '10px' }}>
            Fitness Profile
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Goal', value: member.goal || 'N/A' },
              { label: 'Activity Level', value: member.activityLevel || 'N/A' },
              ...(member.height ? [{ label: 'Height', value: `${member.height} cm` }] : []),
              ...(member.weight ? [{ label: 'Weight', value: `${member.weight} kg` }] : []),
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px', padding: '12px',
              }}>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div style={{ padding: '8px 24px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '14px' }}>
            Activity Timeline
          </div>
          {timeline.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: '13px', margin: 0, fontWeight: 400 }}>No activity recorded yet.</p>
          ) : timeline.slice(0, 5).map(event => (
            <div key={event.id} style={{ display: 'flex', gap: '12px', paddingBottom: '14px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '5px', flexShrink: 0, boxShadow: '0 0 6px var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 500, fontSize: '13px', color: '#fff' }}>{event.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px', fontWeight: 400 }}>{new Date(event.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))}
          {/* Joined event */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-3)', marginTop: '5px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-2)' }}>Joined the gym</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px', fontWeight: 400 }}>
                {new Date(member.createdAt || member.membershipStartDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Danger Zone */}
        <div style={{ padding: '8px 24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              background: 'rgba(255,94,126,0.06)', color: 'var(--error)',
              border: '1px solid rgba(255,94,126,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,94,126,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,94,126,0.06)'}
          >
            <Trash2 size={15} /> Delete Member Profile
          </button>
        </div>

        {/* Hidden Modals */}
        <ExtendModal
          isOpen={isExtendOpen}
          onClose={() => setIsExtendOpen(false)}
          member={member}
          onExtendSuccess={(updatedMember) => {
            setReceiptMember(updatedMember);
            setIsReceiptOpen(true);
          }}
        />
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => { setIsReceiptOpen(false); setReceiptMember(null); }}
          member={receiptMember || member}
          gymData={gymData}
        />
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
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MemberProfileModal;
