import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, FileText, Trash2, UserPlus, Filter, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers, deleteMember, updateMember } from '../services/firestoreService';
import { generateAssessment } from '../core/calculator';

const MemberList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterGoal, setFilterGoal] = useState('all');

  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToMembers(currentUser.uid, (data) => {
        setMembers(data);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [currentUser]);

  const handleDelete = async (memberId) => {
    if (window.confirm('Delete this member? All data will be lost.')) {
      try { await deleteMember(currentUser.uid, memberId); }
      catch { alert('Error deleting member'); }
    }
  };

  const handleResetPassword = async (member) => {
    if (window.confirm(`Reset password for ${member.memberName}? They will be prompted to create a new one on their next login.`)) {
      try {
        await updateMember(currentUser.uid, { ...member, password: '' });
        alert('Password reset successfully!');
      } catch {
        alert('Error resetting password');
      }
    }
  };

  const handleViewAssessment = (member) => {
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

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const goals = ['all', ...new Set(members.map(m => m.goal).filter(Boolean))];

  const filtered = members.filter(m => {
    const matchSearch = m.memberName.toLowerCase().includes(search.toLowerCase());
    const matchGoal = filterGoal === 'all' || m.goal === filterGoal;
    return matchSearch && matchGoal;
  });

  return (
    <div style={{ minHeight: '100vh', padding: '0 20px 40px', position: 'relative', overflow: 'hidden' }}>
      {/* BG Image */}
      <div style={{
         position: 'fixed', inset: 0,
         backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2026&auto=format&fit=crop")',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         opacity: 0.12,
         filter: 'contrast(1.2) grayscale(0.2)',
         mixBlendMode: 'screen',
         pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '20px 0', marginBottom: '24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text)', flexShrink: 0
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-head)', marginBottom: '2px' }}>
              Members
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
              {members.length} total members
            </p>
          </div>
          <button
            onClick={() => navigate('/add-member')}
            style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', color: '#fff', padding: '10px 18px',
              borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.9rem',
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)'
            }}
          >
            <UserPlus size={16} /> Add Member
          </button>
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-3)'
            }} />
            <input
              type="text" className="form-control"
              placeholder="Search members..."
              style={{ paddingLeft: '44px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-3)', zIndex: 1
            }} />
            <select
              className="form-control"
              style={{ paddingLeft: '36px', width: 'auto', minWidth: '160px' }}
              value={filterGoal}
              onChange={e => setFilterGoal(e.target.value)}
            >
              {goals.map(g => (
                <option key={g} value={g}>
                  {g === 'all' ? 'All Goals' : g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed var(--border)', borderRadius: '16px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👥</div>
            <h3 style={{ color: 'var(--text-2)', fontWeight: 500 }}>
              {search ? 'No members found' : 'No members yet'}
            </h3>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginTop: '8px' }}>
              {search ? 'Try a different search term' : 'Add your first member to get started'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/add-member')}
                className="btn btn-primary"
                style={{ marginTop: '20px', width: 'auto', padding: '12px 24px' }}
              >
                <UserPlus size={16} /> Add First Member
              </button>
            )}
          </div>
        ) : (
          filtered.map(m => {
            const bmiColor = getBmiColor(m.bmi);
            const bmiPct = Math.min(((m.bmi || 20) / 40) * 100, 100);
            return (
              <div
                key={m.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  marginBottom: '10px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                  e.currentTarget.style.background = 'rgba(99,102,241,0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${bmiColor}, #6366f1)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1rem', color: '#fff'
                  }}>
                    {getInitials(m.memberName)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{m.memberName}</h3>
                      <span style={{
                        background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600
                      }}>
                        {m.goal}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>
                        BMI: <strong style={{ color: bmiColor }}>{m.bmi?.toFixed(1)}</strong>
                        <span style={{ color: 'var(--text-3)', marginLeft: '4px' }}>({getBmiLabel(m.bmi)})</span>
                      </span>
                      {m.age && <span style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>Age: {m.age}</span>}
                      {m.phone && <span style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>📞 {m.phone}</span>}
                    </div>
                    {/* BMI bar */}
                    <div className="bmi-bar" style={{ marginTop: '8px', width: '200px', maxWidth: '100%' }}>
                      <div className="bmi-fill" style={{ width: `${bmiPct}%`, background: bmiColor }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    {m.password && (
                      <button
                        onClick={() => handleResetPassword(m)}
                        title="Reset Password"
                        style={{
                          width: '38px', height: '38px', borderRadius: '9px',
                          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'var(--gold)', transition: 'all 0.2s'
                        }}
                      >
                        <KeyRound size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleViewAssessment(m)}
                      title="View Assessment"
                      style={{
                        width: '38px', height: '38px', borderRadius: '9px',
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--primary-light)', transition: 'all 0.2s'
                      }}
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      title="Delete Member"
                      style={{
                        width: '38px', height: '38px', borderRadius: '9px',
                        background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--error)', transition: 'all 0.2s'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MemberList;
