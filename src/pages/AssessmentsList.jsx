import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Zap, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers } from '../services/firestoreService';

const AssessmentsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToMembers(currentUser.uid, setMembers);
      return () => unsub();
    }
  }, [currentUser]);

  const filteredMembers = members.filter(m => 
    m.memberName?.toLowerCase().includes(search.toLowerCase()) || 
    m.shortId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-head)', lineHeight: 1.2 }}>AI Assessments</h1>
          <p style={{ color: 'var(--text-2)' }}>Generate and manage AI fitness reports for your members.</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px', gridTemplateColumns: '1fr 2fr' }}>
        
        {/* Left: Quick Generate */}
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px', padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Zap size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Generate New Report</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Create a highly personalized AI workout and diet plan based on a member's current stats and goals.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/assessment')}>
            Go to AI Generator
          </button>
        </div>

        {/* Right: Member Select for History */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Member History</h3>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input
                type="text"
                placeholder="Search member to view reports..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 10px 10px 36px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#fff', fontSize: '0.85rem'
                }}
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', padding: '16px' }}>
            {filteredMembers.map(member => (
              <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{member.memberName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>ID: {member.shortId}</div>
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', width: 'auto', fontSize: '0.8rem' }} onClick={() => navigate(`/assessment?memberId=${member.id}`)}>
                  View Reports <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssessmentsList;
