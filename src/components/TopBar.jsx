import React, { useEffect, useState, useRef } from 'react';
import { Search, Bell, Plus, UserPlus, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers } from '../services/firestoreService';

const TopBar = ({ onSelectMember, onMenuClick }) => {
  const { gymData, currentUser } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (currentUser?.uid) {
      const unsub = subscribeToMembers(currentUser.uid, setMembers);
      return () => unsub();
    }
  }, [currentUser]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = searchQuery.trim()
    ? members.filter(m =>
        m.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.shortId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone?.includes(searchQuery)
      ).slice(0, 6)
    : [];

  const handleSelect = (member) => {
    onSelectMember?.(member);
    setSearchQuery('');
    setIsFocused(false);
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div style={{
      height: '60px',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(7, 5, 20, 0.75)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      gap: '16px',
    }}>
      {/* Mobile Menu Button */}
      <button 
        className="btn btn-ghost mobile-menu-btn" 
        onClick={onMenuClick}
        style={{ padding: '8px', height: 'auto', color: 'var(--text)' }}
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div ref={searchRef} style={{ flex: 1, maxWidth: '380px', position: 'relative' }}>
        <Search size={14} style={{
          position: 'absolute', left: '12px', top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search members, ID, phone..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          style={{
            width: '100%',
            height: '38px',
            padding: '0 12px 0 36px',
            background: 'rgba(10, 8, 30, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            fontSize: '13px',
            outline: 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: 'var(--font)',
          }}
          onFocusCapture={e => {
            e.target.style.borderColor = 'var(--accent)';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.15), 0 0 15px rgba(0, 212, 255, 0.1)';
            e.target.style.background = 'rgba(10, 8, 30, 0.7)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
            e.target.style.background = 'rgba(10, 8, 30, 0.45)';
          }}
        />
 
        {/* Dropdown */}
        {isFocused && searchQuery.trim() && (
          <div className="search-dropdown animate-fade-up">
            {results.length === 0 ? (
              <div style={{ padding: '14px 16px', color: 'var(--text-3)', fontSize: '13px', textAlign: 'center', fontFamily: 'var(--font)' }}>
                No results for "{searchQuery}"
              </div>
            ) : results.map(member => {
              const isExpired = member.membershipEndDate && new Date(member.membershipEndDate) < new Date();
              const balance = (member.membershipFee || 0) - (member.amountPaid || 0);
              return (
                <div
                  key={member.id}
                  className="search-result-item"
                  onClick={() => handleSelect(member)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-2)', fontFamily: 'var(--font)' }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                    background: member.photoUrl ? 'none' : (isExpired ? 'var(--error-bg)' : 'var(--primary-dim)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12px',
                    color: isExpired ? 'var(--error)' : 'var(--primary-light)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                  }}>
                    {member.photoUrl
                      ? <img src={member.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : getInitials(member.memberName)
                    }
                  </div>
 
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.memberName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                      {member.shortId} · {member.phone}
                      {balance > 0 && <span style={{ color: 'var(--error)', marginLeft: '6px', fontWeight: 600 }}>₹{balance} due</span>}
                    </div>
                  </div>
 
                  {/* Status */}
                  <span className={`badge ${isExpired ? 'badge-red' : 'badge-green'}`}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
 
      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick add */}
        <button
          onClick={() => navigate('/add-member')}
          className="btn btn-primary"
          style={{ height: '36px', padding: '0 16px', fontSize: '12.5px', borderRadius: 'var(--radius-sm)' }}
        >
          <Plus size={14} /> Add Member
        </button>
 
        {/* Profile */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-dim) 0%, rgba(93, 169, 255, 0.05) 100%)',
          border: '1px solid rgba(124, 92, 255, 0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '12px', color: 'var(--primary-light)',
          cursor: 'default', flexShrink: 0,
        }}>
          {gymData?.ownerName ? gymData.ownerName[0].toUpperCase() : 'O'}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
