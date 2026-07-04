import React, { useEffect, useState } from 'react';
import { RefreshCw, MessageCircle, AlertTriangle, Phone, CheckCircle, Bell, TrendingDown, Clock, Zap, DollarSign } from 'lucide-react';
import { subscribeToMembers, getMemberStatus, updateMember } from '../services/firestoreService';
import toast from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';
import { getWhatsAppLink } from '../utils/whatsapp';
import { useAuth } from '../contexts/AuthContext';

const Renewals = () => {
  const { currentUser, gymData } = useAuth();
  const [members, setMembers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [selectedPaymentMember, setSelectedPaymentMember] = useState(null);

  // Queue state for sending all reminders
  const [sendingQueue, setSendingQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [isSendingQueueOpen, setIsSendingQueueOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToMembers(currentUser.uid, setMembers);
      return () => unsub();
    }
  }, [currentUser]);

  const membersWithStatus = members.map(m => ({ ...m, status: getMemberStatus(m.membershipEndDate) }));
  const expiringMembers = membersWithStatus.filter(m => m.status === 'Expiring Soon');
  const expiredMembers = membersWithStatus.filter(m => m.status === 'Expired');
  const pendingPaymentMembers = membersWithStatus.filter(m => {
    const fee = m.membershipFee ?? 0;
    const paid = m.amountPaid ?? 0;
    const balance = fee - paid;
    return balance > 0 && m.status !== 'Expired';
  });

  const allRenewals = [...expiredMembers, ...expiringMembers, ...pendingPaymentMembers].sort((a, b) =>
    new Date(a.membershipEndDate) - new Date(b.membershipEndDate)
  );
  const uniqueRenewals = Array.from(new Set(allRenewals.map(a => a.id))).map(id => allRenewals.find(a => a.id === id));

  const generateRenewalMessage = (member) => {
    const gymName = gymData?.gymName || 'our gym';
    const dateStr = member.membershipEndDate ? new Date(member.membershipEndDate).toLocaleDateString('en-GB') : 'N/A';
    
    const text = `🏋️‍♂️ Hi ${member.memberName},\n\n` +
      `Your membership at ${gymName} expired on ${dateStr}.\n\n` +
      `Renew your membership today to continue enjoying:\n` +
      `✅ Unlimited gym access\n` +
      `✅ Member benefits and support\n` +
      `✅ Uninterrupted fitness progress\n\n` +
      `📞 Contact us or visit the gym to renew now.\n\n` +
      `Thank you for being a part of the ${gymName} family!\n\n` +
      `Team ${gymName}`;
      
    return text;
  };

  const handleSendAll = () => {
    const validMembers = uniqueRenewals.filter(m => m.phone && m.phone.replace(/\D/g, '').length >= 10);
    if (validMembers.length === 0) {
      toast.error('No members with valid phone numbers.');
      return;
    }
    
    setSendingQueue(validMembers);
    setCurrentQueueIndex(0);
    setIsSendingQueueOpen(true);
  };

  const handleSendNextInQueue = () => {
    if (currentQueueIndex >= sendingQueue.length) {
      setIsSendingQueueOpen(false);
      return;
    }
    
    const member = sendingQueue[currentQueueIndex];
    const link = getWhatsAppLink(member.phone, generateRenewalMessage(member));
    if (link) window.open(link, '_blank');
    
    if (currentQueueIndex === sendingQueue.length - 1) {
      setIsSendingQueueOpen(false);
      toast.success('All reminders processed!');
    } else {
      setCurrentQueueIndex(prev => prev + 1);
    }
  };

  const handleRenew = async (member) => {
    if (!window.confirm(`Mark ${member.memberName} as Renewed & extend membership by 1 month?`)) return;
    setLoadingId(member.id);
    try {
      const updatedMember = { ...member };
      const currentEnd = new Date(member.membershipEndDate || new Date());
      const today = new Date();
      const baseDate = currentEnd < today ? today : currentEnd;
      baseDate.setMonth(baseDate.getMonth() + 1);
      
      updatedMember.membershipEndDate = baseDate.toISOString().split('T')[0];
      // We do NOT set amountPaid here. The Khata system handles payments separately.
      updatedMember.paymentStatus = 'Pending';
      
      await updateMember(currentUser.uid, updatedMember);
      toast.success('Membership extended. Please log payment if received.');
    } catch (err) {
      toast.error('Failed to renew member');
    } finally {
      setLoadingId(null);
    }
  };

  const getDaysInfo = (member) => {
    const end = new Date(member.membershipEndDate);
    const now = new Date();
    const diffMs = end - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(Math.abs(diffDays) / 30);
    const remDays = Math.abs(diffDays) % 30;
    return { diffDays, diffMonths, remDays };
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #FFA000, #FF5E7E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255,160,0,0.3)'
            }}>
              <Bell size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>Renewal Center</h2>
            </div>
          </div>
          <p style={{ margin: 0, color: 'var(--text-3)' }}>Manage expirations, pending dues, and WhatsApp follow-ups</p>
        </div>
        
        {uniqueRenewals.length > 0 && (
          <button 
            className="btn" 
            onClick={handleSendAll}
            style={{ 
              background: '#25D366', 
              color: '#fff', 
              gap: '8px', 
              boxShadow: '0 4px 12px rgba(37,211,102,0.3)' 
            }}
          >
            <MessageCircle size={18} />
            Send All Reminders
          </button>
        )}
      </div>

      {/* ── Stats Row ── */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        {[
          {
            label: 'Action Required', value: uniqueRenewals.length,
            color: '#7C5CFF', bg: 'rgba(124,92,255,0.08)', border: 'rgba(124,92,255,0.2)',
            icon: <Zap size={20} color="#7C5CFF" />, sub: 'Members need attention'
          },
          {
            label: 'Expiring Soon', value: expiringMembers.length,
            color: '#FFA000', bg: 'rgba(255,160,0,0.08)', border: 'rgba(255,160,0,0.2)',
            icon: <Clock size={20} color="#FFA000" />, sub: 'Within 7 days'
          },
          {
            label: 'Expired / Unpaid', value: expiredMembers.length + pendingPaymentMembers.length,
            color: '#FF5E7E', bg: 'rgba(255,94,126,0.08)', border: 'rgba(255,94,126,0.2)',
            icon: <TrendingDown size={20} color="#FF5E7E" />, sub: 'Immediate action needed'
          },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: '20px', padding: '22px 24px',
            backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-head)', color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: s.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Action Queue ── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', overflow: 'hidden',
        backdropFilter: 'blur(16px)', boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          background: 'rgba(124,92,255,0.04)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <AlertTriangle size={18} color="var(--warning)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Action Queue</div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Members requiring renewal or payment follow-up</div>
          </div>
        </div>

        <div style={{ minHeight: '300px' }}>
          {uniqueRenewals.length === 0 ? (
            <div className="empty-state" style={{ border: 'none', background: 'transparent' }}>
              <CheckCircle size={52} color="var(--success)" />
              <h3 style={{ marginTop: '16px', color: 'var(--success)' }}>All Caught Up! 🎉</h3>
              <p>No members are expiring soon or have pending dues. Great job!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {uniqueRenewals.map(item => {
                const fee = item.membershipFee ?? 0;
                const paid = item.amountPaid ?? 0;
                const balance = fee - paid;
                const isExpired = item.status === 'Expired';
                const hasBalance = balance > 0;
                const urgentColor = isExpired || hasBalance ? '#FF5E7E' : '#FFA000';
                const urgentBg = isExpired || hasBalance ? 'rgba(255,94,126,0.06)' : 'rgba(255,160,0,0.06)';
                const { diffDays, diffMonths, remDays } = getDaysInfo(item);

                return (
                  <div key={item.id} style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 24px', borderBottom: '1px solid var(--border)',
                    gap: '16px', transition: 'background 0.2s',
                    background: 'transparent'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = urgentBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Left — Member Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '200px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: urgentBg, border: `1px solid ${urgentColor}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: urgentColor, flexShrink: 0
                      }}>
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>{item.memberName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Phone size={11} /> {item.phone || 'No phone'}
                        </div>
                      </div>
                    </div>

                    {/* Center — Status Info */}
                    <div style={{ minWidth: '160px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Expiry Date</div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: isExpired ? '#FF5E7E' : 'var(--text)' }}>
                        {new Date(item.membershipEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '3px', color: isExpired ? '#FF5E7E' : '#FFA000' }}>
                        {isExpired
                          ? `Expired ${diffMonths > 0 ? `${diffMonths}mo ` : ''}${remDays}d ago`
                          : `${diffMonths > 0 ? `${diffMonths}mo ${remDays}d` : `${diffDays}d`} remaining`
                        }
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px' }}>
                        Balance:{' '}
                        {hasBalance ? (
                          <span style={{ color: '#FF5E7E', fontWeight: 700 }}>₹{balance} pending</span>
                        ) : (
                          <span style={{ color: 'var(--success)', fontWeight: 700 }}>Paid ✓</span>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {isExpired && <span className="badge badge-red">Expired</span>}
                      {!isExpired && item.status === 'Expiring Soon' && <span className="badge badge-gold">Expiring Soon</span>}
                      {hasBalance && <span className="badge badge-red">Balance Due</span>}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                      <a
                        href={getWhatsAppLink(item.phone, generateRenewalMessage(item)) || '#'}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '9px 16px', borderRadius: '10px',
                          background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)',
                          color: '#25D366', fontWeight: 700, fontSize: '13px',
                          textDecoration: 'none', transition: 'all 0.2s',
                          height: '40px',
                          opacity: getWhatsAppLink(item.phone) ? 1 : 0.5,
                          pointerEvents: getWhatsAppLink(item.phone) ? 'auto' : 'none'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.12)'; e.currentTarget.style.transform = ''; }}
                        onClick={e => { if (!getWhatsAppLink(item.phone)) { e.preventDefault(); toast.error('Add a valid phone number first.'); } }}
                      >
                        <MessageCircle size={15} />
                        <span className="hide-mobile">WhatsApp</span>
                      </a>
                      <button
                        className="btn btn-outline"
                        style={{ gap: '6px', height: '40px' }}
                        onClick={() => setSelectedPaymentMember(item)}
                        disabled={balance <= 0}
                      >
                        <DollarSign size={15} />
                        <span className="hide-mobile">Pay</span>
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ gap: '6px', height: '40px' }}
                        onClick={() => handleRenew(item)}
                        disabled={loadingId === item.id}
                      >
                        <RefreshCw size={15} className={loadingId === item.id ? 'spin' : ''} />
                        <span className="hide-mobile">{loadingId === item.id ? 'Updating…' : 'Extend'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <PaymentModal 
        isOpen={!!selectedPaymentMember} 
        onClose={() => setSelectedPaymentMember(null)} 
        member={selectedPaymentMember} 
        onPaymentSuccess={(paymentRecord, updatedMember) => {
          // Success handled in modal, optionally trigger PDF generation here
        }}
      />

      {/* Sending Queue Modal */}
      {isSendingQueueOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-panel" style={{ padding: '24px', maxWidth: '400px', textAlign: 'center' }}>
            <MessageCircle size={48} color="#25D366" style={{ marginBottom: '16px' }} />
            <h3>Sending Reminders</h3>
            <p style={{ margin: '16px 0' }}>
              Sending message {currentQueueIndex + 1} of {sendingQueue.length}.<br/>
              WhatsApp requires opening tabs individually to prevent spam.
            </p>
            <div style={{ padding: '16px', background: 'rgba(37,211,102,0.1)', borderRadius: '12px', marginBottom: '24px', fontWeight: 600 }}>
              Next: {sendingQueue[currentQueueIndex]?.memberName}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsSendingQueueOpen(false)}>
                Cancel
              </button>
              <button className="btn" style={{ flex: 2, background: '#25D366', color: '#fff', border: 'none' }} onClick={handleSendNextInQueue}>
                <MessageCircle size={16} /> Send & Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Renewals;
