import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Plus, UserCheck, Clock, UserX,
  MessageCircle, RefreshCw, Phone, X, ChevronRight, Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers, subscribeToEnquiries, getMemberStatus } from '../services/firestoreService';
import MemberProfileModal from '../components/MemberProfileModal';
import ImportMembersModal from '../components/ImportMembersModal';

const Members = () => {
  const navigate = useNavigate();
  const { currentUser, gymData } = useAuth();
  const [members, setMembers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const u1 = subscribeToMembers(currentUser.uid, setMembers);
    const u2 = subscribeToEnquiries(currentUser.uid, setEnquiries);
    return () => { u1(); u2(); };
  }, [currentUser]);

  const membersWithStatus = members.map(m => ({
    ...m, status: getMemberStatus(m.membershipEndDate)
  }));

  const tabs = [
    { id: 'all',      label: 'All',     count: members.length },
    { id: 'active',   label: 'Active',  count: membersWithStatus.filter(m => m.status === 'Active').length },
    { id: 'expiring', label: 'Expiring',count: membersWithStatus.filter(m => m.status === 'Expiring Soon').length },
    { id: 'expired',  label: 'Expired', count: membersWithStatus.filter(m => m.status === 'Expired').length },
    { id: 'leads',    label: 'Leads',   count: enquiries.length },
  ];

  let display = activeTab === 'leads' ? enquiries
    : activeTab === 'all' ? membersWithStatus
    : membersWithStatus.filter(m =>
        activeTab === 'active' ? m.status === 'Active'
        : activeTab === 'expiring' ? m.status === 'Expiring Soon'
        : m.status === 'Expired'
      );

  if (search.trim()) {
    const s = search.toLowerCase();
    display = display.filter(item =>
      (item.memberName || item.name || '').toLowerCase().includes(s) ||
      (item.phone || '').includes(s) ||
      (item.shortId || '').toLowerCase().includes(s)
    );
  }

  const getStatusColor = (status) => {
    if (status === 'Active') return { text: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)' };
    if (status === 'Expiring Soon') return { text: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' };
    if (status === 'Expired') return { text: 'var(--error)', bg: 'var(--error-bg)', border: 'var(--error-border)' };
    return { text: 'var(--text-3)', bg: 'transparent', border: 'var(--border)' };
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const getWaLink = (m) => {
    const phone = (m.phone || '').replace(/\D/g, '');
    if (!phone) return '#';
    const fp = phone.length === 10 ? `91${phone}` : phone;
    const bal = (m.membershipFee || 0) - (m.amountPaid || 0);
    const gymName = gymData?.gymName || 'our gym';
    const dateStr = new Date(m.membershipEndDate).toLocaleDateString('en-GB');

    let text = `Hi ${m.memberName || m.name} 👋\n\n`;

    if (m.status === 'Expired') {
      text += `Your membership at ${gymName} expired on ${dateStr}.\n\n`;
      text += `Renew now to continue enjoying uninterrupted access to the gym and member benefits.\n\n`;
    } else if (m.status === 'Expiring Soon') {
      text += `Your membership at ${gymName} will expire on ${dateStr}.\n\n`;
      text += `Renew now to continue enjoying uninterrupted access to the gym and member benefits.\n\n`;
    } else if (bal > 0) {
      text += `You have an outstanding balance of ₹${bal} at ${gymName}.\n\n`;
      text += `Kindly clear your dues to continue enjoying uninterrupted access to the gym and member benefits.\n\n`;
    } else {
      text += `We hope you are enjoying your workouts at ${gymName}!\n\n`;
    }

    text += `Thank you,\nTeam ${gymName}`;

    return `https://wa.me/${fp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div className="page-header-left">
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>Members</h2>
          <p className="text-muted" style={{ marginTop: '4px' }}>
            {members.length} registered members &bull; {enquiries.length} leads in CRM
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsImportOpen(true)}
            className="btn btn-outline"
            style={{ height: '40px', padding: '0 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Upload size={15} /> Import Excel
          </button>
          <button
            onClick={() => navigate('/add-member')}
            className="btn btn-primary"
            style={{ height: '40px', padding: '0 18px', borderRadius: 'var(--radius-sm)' }}
          >
            <Plus size={15} /> Add Member
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="tabs" style={{ marginBottom: '24px' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px' }}
          >
            {t.label}
            <span style={{
              background: activeTab === t.id ? 'rgba(0, 212, 255, 0.12)' : 'rgba(255,255,255,0.03)',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text-3)',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
              border: activeTab === t.id ? '1px solid rgba(0, 212, 255, 0.2)' : '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.2s'
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
        <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input
          type="text"
          className="form-control"
          placeholder="Search name, phone, or member ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            paddingLeft: '38px',
            paddingRight: search ? '38px' : '14px',
            fontSize: '13.5px',
            height: '42px',
            background: 'rgba(10, 8, 30, 0.45)',
            borderColor: 'var(--border)'
          }}
          onFocusCapture={e => {
            e.target.style.borderColor = 'var(--accent)';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.12)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results Count Banner */}
      {search && (
        <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '16px', fontWeight: 500 }}>
          Found {display.length} result{display.length !== 1 ? 's' : ''} for "{search}"
        </div>
      )}

      {/* Grid List Container */}
      {display.length === 0 ? (
        <div className="empty-state" style={{ padding: '64px 24px' }}>
          <Users size={40} color="var(--primary-light)" />
          <h3 style={{ marginTop: '16px' }}>{search ? 'No results found' : activeTab === 'leads' ? 'No leads yet' : 'No members found'}</h3>
          <p>
            {search ? 'Try adjusting your search query.'
              : activeTab === 'leads' ? 'Walk-in leads registered on your dashboard will appear here.'
              : 'Add your first member to begin tracking.'}
          </p>
          {!search && activeTab !== 'leads' && (
            <button
              onClick={() => navigate('/add-member')}
              className="btn btn-primary mt-4"
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', height: '40px' }}
            >
              <Plus size={15} /> Add First Member
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          {/* Table Header Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 0.8fr 1fr',
            padding: '14px 24px',
            background: 'rgba(20, 16, 50, 0.65)',
            borderBottom: '1px solid var(--border)',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-3)',
          }}>
            <span>Member</span>
            <span>{activeTab === 'leads' ? 'Status' : 'Renewal Expiry'}</span>
            <span>Balance</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {/* Rows List */}
          <div style={{ background: 'rgba(10, 8, 30, 0.15)' }}>
            {display.map(item => {
              const isLead = activeTab === 'leads';
              const bal = isLead ? 0 : (item.membershipFee || 0) - (item.amountPaid || 0);
              const sc = getStatusColor(item.status);

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 0.8fr 1fr',
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-2)',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: !isLead ? 'pointer' : 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(124, 92, 255, 0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  onClick={() => !isLead && setSelectedMember(item)}
                >
                  {/* Name + Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      flexShrink: 0, overflow: 'hidden',
                      background: item.photoUrl ? 'none' : 'var(--primary-dim)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '13px', color: 'var(--primary-light)',
                      border: '1px solid var(--border)',
                    }}>
                      {item.photoUrl
                        ? <img src={item.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : getInitials(item.memberName || item.name)
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.memberName || item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontWeight: 500 }}>
                        <span>{item.phone || 'No phone'}</span>
                        {item.shortId && <span style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 700 }}>{item.shortId}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Expiry / Status */}
                  <div>
                    {isLead ? (
                      <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                        {item.status || 'New Lead'}
                      </span>
                    ) : (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                          {item.membershipEndDate ? new Date(item.membershipEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </div>
                        <div style={{
                          display: 'inline-block', marginTop: '4px',
                          fontSize: '9px', fontWeight: 800,
                          background: sc.bg, color: sc.text,
                          border: `1px solid ${sc.border}`,
                          padding: '1px 8px', borderRadius: '999px',
                          letterSpacing: '0.04em', textTransform: 'uppercase'
                        }}>
                          {item.status}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Balance Pending */}
                  <div>
                    {bal > 0 ? (
                      <span style={{ color: 'var(--error)', fontWeight: 800, fontSize: '13.5px' }}>₹{bal.toLocaleString('en-IN')}</span>
                    ) : (
                      <span style={{ color: 'var(--text-3)', fontSize: '13px' }}>—</span>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    {!isLead && (
                      <a
                        href={getWaLink(item)}
                        target="_blank" rel="noopener noreferrer"
                        className="btn"
                        style={{
                          background: 'rgba(18, 140, 126, 0.1)',
                          border: '1px solid rgba(18, 140, 126, 0.2)',
                          color: '#25D366',
                          height: '32px',
                          width: '32px',
                          padding: 0,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={e => { if (!item.phone) { e.preventDefault(); alert('No phone number configured.'); } }}
                        title="Send WhatsApp text"
                      >
                        <MessageCircle size={14} />
                      </a>
                    )}
                    {(item.status === 'Expired' || item.status === 'Expiring Soon') && (
                      <button
                        className="btn btn-outline"
                        style={{
                          height: '32px',
                          width: '32px',
                          padding: 0,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => navigate('/renewals')}
                        title="Renew membership"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                    {!isLead && (
                      <button
                        className="btn btn-ghost"
                        style={{
                          height: '32px',
                          width: '32px',
                          padding: 0,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => setSelectedMember(item)}
                        title="View Full Profile"
                      >
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          gymId={currentUser.uid}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Import Members Modal */}
      <ImportMembersModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        gymId={currentUser?.uid}
      />
    </div>
  );
};


export default Members;
