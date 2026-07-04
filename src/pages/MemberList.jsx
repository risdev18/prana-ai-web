import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, FileText, Trash2, UserPlus, Filter, KeyRound, MessageCircle, DollarSign, Calendar, Activity, Users, Download, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers, deleteMember, updateMember } from '../services/firestoreService';
import { generateAssessment } from '../core/calculator';
import MemberProfileModal from '../components/MemberProfileModal';
import ImportMembersModal from '../components/ImportMembersModal';


const MemberList = () => {
  const navigate = useNavigate();
  const { currentUser, gymData } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterGoal, setFilterGoal] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToMembers(currentUser.uid, (data) => {
        setMembers(data);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [currentUser]);

  const handleDelete = async (e, memberId) => {
    e.stopPropagation();
    if (window.confirm('Delete this member? All data will be lost.')) {
      try { await deleteMember(currentUser.uid, memberId); }
      catch { alert('Error deleting member'); }
    }
  };

  const handleResetPassword = async (e, member) => {
    e.stopPropagation();
    if (window.confirm(`Reset password for ${member.memberName}? They will be prompted to create a new one on their next login.`)) {
      try {
        await updateMember(currentUser.uid, { ...member, password: '' });
        alert('Password reset successfully!');
      } catch {
        alert('Error resetting password');
      }
    }
  };

  const handleViewAssessment = (e, member) => {
    e.stopPropagation();
    const assessment = generateAssessment(member);
    navigate('/assessment', { state: { assessment, isNew: false } });
  };

  const getBmiColor = (bmi) => {
    if (!bmi) return '#6366f1';
    if (bmi < 18.5) return '#06b6d4';
    if (bmi < 25) return '#06d6a0';
    if (bmi < 30) return '#f59e0b';
    return '#f43f5e';
  };

  const getBmiLabel = (bmi) => {
    if (!bmi) return 'N/A';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getMemberStatus = (endDateStr) => {
    if (!endDateStr) return 'Active';
    const end = new Date(endDateStr);
    const today = new Date();
    const diff = (end - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'Expired';
    if (diff <= 5) return 'Expiring';
    return 'Active';
  };

  const getWhatsAppReminderLink = (member) => {
    const phone = member.phone?.replace(/\D/g, '');
    if (!phone) return '#';
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
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
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const goals = ['all', ...new Set(members.map(m => m.goal).filter(Boolean))];

  const filtered = members.filter(m => {
    const matchSearch = m.memberName.toLowerCase().includes(search.toLowerCase()) || m.shortId?.toLowerCase().includes(search.toLowerCase());
    const matchGoal = filterGoal === 'all' || m.goal === filterGoal;
    return matchSearch && matchGoal;
  });

  const handleExportCSV = () => {
    if (members.length === 0) return alert('No members to export');

    const headers = ['Name', 'ID', 'Phone', 'Membership Plan', 'Start Date', 'Expiry Date', 'Amount Paid', 'Membership Fee', 'Balance'];
    const rows = members.map(m => {
      const balance = (m.membershipFee || 0) - (m.amountPaid || 0);
      return [
        m.memberName || '',
        m.shortId || '',
        m.phone || '',
        m.membershipPlan || '',
        m.membershipStartDate || '',
        m.membershipEndDate || '',
        m.amountPaid || 0,
        m.membershipFee || 0,
        balance
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${gymData?.gymName || 'Gym'}_Members_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '0 20px 60px', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle background overlay */}
      <div style={{
         position: 'fixed', inset: 0,
         backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2026&auto=format&fit=crop")',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         opacity: 0.03,
         filter: 'contrast(1.2) grayscale(0.8)',
         mixBlendMode: 'screen',
         pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '24px 0', marginBottom: '32px',
          borderBottom: '1px solid var(--border)'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text)', flexShrink: 0,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-head)', fontWeight: 800, marginBottom: '4px' }}>
              Members Hub
            </h1>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              {members.length} registered members in your gym
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
            <button
              onClick={handleExportCSV}
              className="btn btn-outline"
              style={{
                height: '40px',
                padding: '0 16px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="btn btn-outline"
              style={{
                height: '40px',
                padding: '0 16px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Upload size={15} /> Import Excel
            </button>
            <button
              onClick={() => navigate('/add-member')}
              className="btn btn-primary"
              style={{
                height: '40px',
                padding: '0 18px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <UserPlus size={15} /> Add Member
            </button>
          </div>
        </div>


        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={14} style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-3)'
            }} />
            <input
              type="text" className="form-control"
              placeholder="Search by name or ID..."
              style={{ paddingLeft: '38px', height: '42px', fontSize: '13.5px', background: 'rgba(10, 8, 30, 0.45)' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocusCapture={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={14} style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-3)', zIndex: 1
            }} />
            <select
              className="form-control"
              style={{ paddingLeft: '36px', width: 'auto', minWidth: '180px', height: '42px', fontSize: '13.5px', background: 'rgba(10, 8, 30, 0.45)' }}
              value={filterGoal}
              onChange={e => setFilterGoal(e.target.value)}
              onFocusCapture={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            >
              {goals.map(g => (
                <option key={g} value={g}>
                  {g === 'all' ? 'All Fitness Goals' : g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="loader">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '64px 24px' }}>
            <Users size={40} color="var(--primary-light)" />
            <h3 style={{ marginTop: '16px' }}>
              {search ? 'No members found' : 'No members yet'}
            </h3>
            <p>
              {search ? 'Try adjusting your search filters or queries.' : 'Register your first gym member to begin tracking operations.'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/add-member')}
                className="btn btn-primary"
                style={{ marginTop: '20px', height: '40px', padding: '0 20px', borderRadius: 'var(--radius-sm)' }}
              >
                <UserPlus size={15} /> Add First Member
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(m => {
              const bmiColor = getBmiColor(m.bmi);
              const status = getMemberStatus(m.membershipEndDate);
              const balance = (m.membershipFee || 0) - (m.amountPaid || 0);
              
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMember(m)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.35)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Photo / Avatar */}
                    {m.photoUrl ? (
                      <img 
                        src={m.photoUrl} 
                        alt={m.memberName} 
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${bmiColor}25, rgba(124, 92, 255, 0.15))`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: bmiColor, fontSize: '15px',
                        border: `1px solid ${bmiColor}40`
                      }}>
                        {getInitials(m.memberName)}
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 2, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#fff', margin: 0 }}>{m.memberName}</h3>
                        <span className={`badge ${status === 'Expired' ? 'badge-red' : status === 'Expiring' ? 'badge-gold' : 'badge-green'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                          {status}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginTop: '4px', fontWeight: 500 }}>
                        ID: <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{m.shortId}</span> &bull; 📞 {m.phone || 'No phone'}
                      </div>

                      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap', fontSize: '12px' }}>
                        {m.bmi && (
                          <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>
                            BMI: <strong style={{ color: bmiColor }}>{m.bmi.toFixed(1)}</strong> ({getBmiLabel(m.bmi)})
                          </span>
                        )}
                        {m.goal && (
                          <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>
                            Goal: <strong style={{ color: 'var(--accent-light)' }}>{m.goal}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Financials / Dues */}
                    <div style={{ flex: 1.5, minWidth: '150px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Financial Status</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '6px' }}>
                        Membership: <strong>₹{m.membershipFee || 0}</strong>
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '2px' }}>
                        Dues: {balance > 0 ? (
                          <span style={{ color: 'var(--error)', fontWeight: 700 }}>₹{balance.toLocaleString('en-IN')} pending</span>
                        ) : (
                          <span style={{ color: 'var(--success)', fontWeight: 700 }}>Paid ✓</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>
                      <a
                        href={getWhatsAppReminderLink(m)}
                        target="_blank" rel="noopener noreferrer"
                        title="Send WhatsApp text"
                        style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#25D366', transition: 'all 0.2s'
                        }}
                      >
                        <MessageCircle size={15} />
                      </a>
                      
                      {m.password && (
                        <button
                          onClick={(e) => handleResetPassword(e, m)}
                          title="Reset password credential"
                          style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            background: 'rgba(255,160,0,0.08)', border: '1px solid rgba(255,160,0,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--gold)', transition: 'all 0.2s'
                          }}
                        >
                          <KeyRound size={14} />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleViewAssessment(e, m)}
                        title="View AI Fitness assessment"
                        style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          background: 'rgba(124, 92, 255, 0.08)', border: '1px solid rgba(124, 92, 255, 0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'var(--primary-light)', transition: 'all 0.2s'
                        }}
                      >
                        <FileText size={14} />
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, m.id)}
                        title="Delete member profile"
                        style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          background: 'rgba(255, 94, 126, 0.08)', border: '1px solid rgba(255, 94, 126, 0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'var(--error)', transition: 'all 0.2s'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Profile Modal */}
      {selectedMember && currentUser && (
        <MemberProfileModal
          member={selectedMember}
          gymId={currentUser.uid}
          gymData={gymData}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Import Modal */}
      <ImportMembersModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        gymId={currentUser?.uid}
      />
    </div>
  );
};



export default MemberList;
