import React, { useEffect, useState } from 'react';
import { RefreshCw, MessageCircle, AlertTriangle, Phone, CheckCircle } from 'lucide-react';
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

  // Derived states
  const membersWithStatus = members.map(m => ({ ...m, status: getMemberStatus(m.membershipEndDate) }));

  const expiringMembers = membersWithStatus.filter(m => m.status === 'Expiring Soon');
  const expiredMembers = membersWithStatus.filter(m => m.status === 'Expired');
  const pendingPaymentMembers = membersWithStatus.filter(m => m.paymentStatus === 'Pending' && m.status !== 'Expired');
  
  const allRenewals = [...expiredMembers, ...expiringMembers, ...pendingPaymentMembers].sort((a, b) => 
    new Date(a.membershipEndDate) - new Date(b.membershipEndDate)
  );
  
  // Dedup logic in case someone is both pending payment and expired
  const uniqueRenewals = Array.from(new Set(allRenewals.map(a => a.id))).map(id => allRenewals.find(a => a.id === id));

  const getWhatsAppLink = (member) => {
    const phone = member.phone?.replace(/\D/g, '');
    if (!phone) return '#';
    
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    const gymName = gymData?.gymName || 'our gym';
    let statusText = member.status === 'Expired' ? 'has expired' : 'is expiring soon';
    if (member.paymentStatus === 'Pending' && member.status !== 'Expired') {
      statusText = 'has a pending payment due';
    }
    
    const message = encodeURIComponent(`Hi ${member.memberName}, your membership at ${gymName} ${statusText}. Please renew or clear dues to continue your fitness journey!`);
    
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  const handleRenew = async (member) => {
    if (!window.confirm(`Mark ${member.memberName} as Renewed/Paid?`)) return;
    
    setLoadingId(member.id);
    try {
      const updatedMember = { ...member };
      
      // If expired or expiring soon, extend by 1 month.
      if (member.status === 'Expired' || member.status === 'Expiring Soon') {
        const currentEnd = new Date(member.membershipEndDate);
        const today = new Date();
        const baseDate = currentEnd < today ? today : currentEnd;
        baseDate.setMonth(baseDate.getMonth() + 1);
        updatedMember.membershipEndDate = baseDate.toISOString().split('T')[0];
      }
      
      // Always mark as paid
      updatedMember.paymentStatus = 'Paid';
      
      await updateMember(currentUser.uid, updatedMember);
    } catch (err) {
      alert('Failed to renew member');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Renewal Center</h2>
          <p className="text-muted">Manage expirations, pending dues, and send WhatsApp reminders.</p>
        </div>
      </div>

      <div className="grid-3 mb-6">
        <div className="card text-center" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-3)', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600 }}>Total Actionable</div>
          <div style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px' }}>{uniqueRenewals.length}</div>
        </div>
        <div className="card text-center" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--warning)', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600 }}>Expiring Soon</div>
          <div style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px' }}>{expiringMembers.length}</div>
        </div>
        <div className="card text-center" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--error)', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600 }}>Expired / Unpaid</div>
          <div style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px' }}>{expiredMembers.length + pendingPaymentMembers.length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Action Queue</h3>
        </div>

        <div style={{ minHeight: '300px' }}>
          {uniqueRenewals.length === 0 ? (
            <div className="empty-state" style={{ border: 'none' }}>
              <CheckCircle size={48} color="var(--success)" />
              <h3 style={{ marginTop: '16px' }}>All caught up!</h3>
              <p>No members are expiring soon or have pending dues. Great job!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {uniqueRenewals.map(item => (
                <div key={item.id} style={{ 
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '16px 20px', borderBottom: '1px solid var(--border)', gap: '16px' 
                }}>
                  
                  {/* Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: (item.status === 'Expired' || item.paymentStatus === 'Pending') ? 'var(--error-bg)' : 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (item.status === 'Expired' || item.paymentStatus === 'Pending') ? 'var(--error)' : 'var(--warning)' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '15px' }}>{item.memberName}</div>
                      <div style={{ color: 'var(--text-2)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={12} /> {item.phone || 'No phone number'}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ minWidth: '150px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase' }}>Expiry Date</div>
                    <div style={{ 
                      fontSize: '14px', fontWeight: 600,
                      color: item.status === 'Expired' ? 'var(--error)' : 'var(--text)' 
                    }}>
                      {new Date(item.membershipEndDate).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span className={`badge ${item.status === 'Expired' ? 'badge-red' : item.status === 'Expiring Soon' ? 'badge-gold' : 'badge-green'}`}>
                        {item.status}
                      </span>
                      {item.paymentStatus === 'Pending' && (
                        <span className="badge badge-red">Unpaid</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                    <a 
                      href={getWhatsAppLink(item)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ background: '#25D366', color: '#fff', textDecoration: 'none' }}
                      onClick={(e) => {
                        if (!item.phone) {
                          e.preventDefault();
                          alert('Please add a phone number for this member first.');
                        }
                      }}
                    >
                      <MessageCircle size={16} /> <span className="hide-mobile">WhatsApp</span>
                    </a>
                    <button 
                      className="btn btn-outline" 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => handleRenew(item)}
                      disabled={loadingId === item.id}
                    >
                      <RefreshCw size={16} className={loadingId === item.id ? 'spin' : ''} /> 
                      <span className="hide-mobile">{loadingId === item.id ? 'Updating...' : 'Mark Renewed'}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Renewals;
