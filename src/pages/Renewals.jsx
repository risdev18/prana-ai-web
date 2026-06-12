import React, { useEffect, useState } from 'react';
import { RefreshCw, MessageCircle, AlertTriangle, Phone, CheckCircle, Bell, TrendingDown, Clock, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers, getMemberStatus, updateMember } from '../services/firestoreService';

const Renewals = () => {
  const { currentUser, gymData } = useAuth();
  const [members, setMembers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

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
    const balance = (m.membershipFee || 0) - (m.amountPaid || 0);
    return balance > 0 && m.status !== 'Expired';
  });

  const allRenewals = [...expiredMembers, ...expiringMembers, ...pendingPaymentMembers].sort((a, b) =>
    new Date(a.membershipEndDate) - new Date(b.membershipEndDate)
  );
  const uniqueRenewals = Array.from(new Set(allRenewals.map(a => a.id))).map(id => allRenewals.find(a => a.id === id));

  const getWhatsAppLink = (member) => {
    const phone = member.phone?.replace(/\D/g, '');
    if (!phone) return '#';
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    const gymName = gymData?.gymName || 'our gym';
    const balance = (member.membershipFee || 0) - (member.amountPaid || 0);
    const end = new Date(member.membershipEndDate);
    const now = new Date();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    const absDays = Math.abs(diffDays);
    const months = Math.floor(absDays / 30);
    const days = absDays % 30;
    const timeStr = months > 0 ? `${months} month${months > 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}` : `${absDays} day${absDays !== 1 ? 's' : ''}`;

    let text = `Hi ${member.memberName}, this is a message from *${gymName}* 🏋️\n\n`;
    if (member.status === 'Expired') {
      text += `⚠️ *Membership Expired*\nYour membership expired ${timeStr} ago (on ${new Date(member.membershipEndDate).toLocaleDateString()}).\n\n`;
    } else {
      text += `📅 *Membership Expiring Soon*\nYour membership expires in *${timeStr}* (on ${new Date(member.membershipEndDate).toLocaleDateString()}).\n\n`;
    }
    if (balance > 0) {
      text += `💸 *Outstanding Dues: ₹${balance}*\nKindly clear your balance to avoid service interruption.\n\n`;
    }
    text += `Please renew your membership to continue enjoying our facilities. Thank you! 🙏`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleRenew = async (member) => {
    if (!window.confirm(`Mark ${member.memberName} as Renewed & Fully Paid?`)) return;
    setLoadingId(member.id);
    try {
      const updatedMember = { ...member };
      const currentEnd = new Date(member.membershipEndDate || new Date());
      const today = new Date();
      const baseDate = currentEnd < today ? today : currentEnd;
      baseDate.setMonth(baseDate.getMonth() + 1);
      updatedMember.membershipEndDate = baseDate.toISOString().split('T')[0];
      updatedMember.amountPaid = updatedMember.membershipFee || 1500;
      updatedMember.paymentStatus = 'Paid';
      await updateMember(currentUser.uid, updatedMember);
    } catch (err) {
      alert('Failed to renew member');
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
      <div style={{ marginBottom: '28px' }}>
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
                const balance = (item.membershipFee || 0) - (item.amountPaid || 0);
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
                        href={getWhatsAppLink(item)}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '9px 16px', borderRadius: '10px',
                          background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)',
                          color: '#25D366', fontWeight: 700, fontSize: '13px',
                          textDecoration: 'none', transition: 'all 0.2s',
                          height: '40px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.12)'; e.currentTarget.style.transform = ''; }}
                        onClick={e => { if (!item.phone) { e.preventDefault(); alert('Add a phone number first.'); } }}
                      >
                        <MessageCircle size={15} />
                        <span className="hide-mobile">WhatsApp</span>
                      </a>
                      <button
                        className="btn btn-outline"
                        style={{ gap: '6px', height: '40px' }}
                        onClick={() => handleRenew(item)}
                        disabled={loadingId === item.id}
                      >
                        <RefreshCw size={15} className={loadingId === item.id ? 'spin' : ''} />
                        <span className="hide-mobile">{loadingId === item.id ? 'Updating…' : 'Mark Renewed'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Renewals;
