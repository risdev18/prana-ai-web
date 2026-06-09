import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, UserCheck, Clock, UserX, AlertCircle, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers, subscribeToEnquiries, getMemberStatus } from '../services/firestoreService';
import MemberProfileModal from '../components/MemberProfileModal';

const Members = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('active'); // active, expiring, expired, leads
  const [members, setMembers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const unsubMembers = subscribeToMembers(currentUser.uid, setMembers);
      const unsubEnquiries = subscribeToEnquiries(currentUser.uid, setEnquiries);
      return () => { unsubMembers(); unsubEnquiries(); };
    }
  }, [currentUser]);

  // Derived states
  const membersWithStatus = members.map(m => ({ ...m, status: getMemberStatus(m.membershipEndDate) }));

  const activeMembers = membersWithStatus.filter(m => m.status === 'Active');
  const expiringMembers = membersWithStatus.filter(m => m.status === 'Expiring Soon');
  const expiredMembers = membersWithStatus.filter(m => m.status === 'Expired');

  let displayData = [];
  if (activeTab === 'active') displayData = activeMembers;
  else if (activeTab === 'expiring') displayData = expiringMembers;
  else if (activeTab === 'expired') displayData = expiredMembers;
  else if (activeTab === 'leads') displayData = enquiries; // Different schema

  const filteredData = displayData.filter(item => {
    const term = search.toLowerCase();
    const name = (item.memberName || item.name || '').toLowerCase();
    const phone = item.phone || '';
    const sid = (item.shortId || '').toLowerCase();
    return name.includes(term) || phone.includes(term) || sid.includes(term);
  });

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px', borderRadius: '10px',
        background: activeTab === id ? 'rgba(99,102,241,0.15)' : 'transparent',
        border: activeTab === id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
        color: activeTab === id ? '#fff' : 'var(--text-2)',
        cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
        transition: 'all 0.2s'
      }}
    >
      <Icon size={16} color={activeTab === id ? 'var(--primary-light)' : 'var(--text-3)'} />
      {label}
      <span style={{
        background: activeTab === id ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
        padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', color: '#fff'
      }}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-head)', lineHeight: 1.2 }}>Members Hub</h1>
          <p style={{ color: 'var(--text-2)' }}>Manage memberships, renewals, and leads.</p>
        </div>
        <button onClick={() => navigate('/add-member')} className="btn btn-primary" style={{ padding: '10px 20px', width: 'auto' }}>
          <Plus size={18} /> New Member
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        <TabButton id="active" label="Active" icon={UserCheck} count={activeMembers.length} />
        <TabButton id="expiring" label="Expiring Soon" icon={Clock} count={expiringMembers.length} />
        <TabButton id="expired" label="Expired" icon={UserX} count={expiredMembers.length} />
        <TabButton id="leads" label="Leads (CRM)" icon={Users} count={enquiries.length} />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search in current tab..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 36px 10px 36px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff', fontSize: '0.85rem'
              }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{ 
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                  background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* List View */}
        <div style={{ minHeight: '400px' }}>
          {filteredData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
              No records found.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>Contact</th>
                  {activeTab !== 'leads' && <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>ID</th>}
                  {activeTab !== 'leads' && <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>Expiry</th>}
                  {activeTab === 'leads' && <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>Status</th>}
                  <th style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>
                          {item.memberName ? item.memberName[0] : (item.name ? item.name[0] : '?')}
                        </div>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{item.memberName || item.name}</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-2)', fontSize: '0.85rem' }}>{item.phone || 'N/A'}</td>

                    {activeTab !== 'leads' && (
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          {item.shortId}
                        </span>
                      </td>
                    )}

                    {activeTab !== 'leads' && (
                      <td style={{ padding: '16px 20px', fontSize: '0.85rem' }}>
                        <div style={{ color: activeTab === 'expired' ? 'var(--error)' : activeTab === 'expiring' ? 'var(--gold)' : 'var(--text)' }}>
                          {new Date(item.membershipEndDate).toLocaleDateString()}
                        </div>
                      </td>
                    )}

                    {activeTab === 'leads' && (
                      <td style={{ padding: '16px 20px' }}>
                        <span className="badge badge-purple">{item.status || 'New'}</span>
                      </td>
                    )}

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto' }}
                        onClick={() => setSelectedMember(item)}
                      >
                        View <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Member Profile Modal */}
      {selectedMember && (
        <MemberProfileModal 
          member={selectedMember} 
          gymId={currentUser.uid} 
          onClose={() => setSelectedMember(null)} 
        />
      )}
    </div>
  );
};

export default Members;
