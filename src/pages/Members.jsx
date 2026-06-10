import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, UserCheck, Clock, UserX, ChevronRight, X, Phone } from 'lucide-react';
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
  else if (activeTab === 'leads') displayData = enquiries;

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
        padding: '10px 16px', borderRadius: '12px',
        background: activeTab === id ? 'var(--primary)' : 'var(--bg-card)',
        border: '1px solid',
        borderColor: activeTab === id ? 'var(--primary)' : 'var(--border)',
        color: activeTab === id ? '#fff' : 'var(--text-2)',
        cursor: 'pointer', fontWeight: 600, fontSize: '14px',
        transition: 'all 0.2s', flexShrink: 0
      }}
    >
      <Icon size={16} color={activeTab === id ? '#fff' : 'var(--text-3)'} />
      {label}
      <span style={{
        background: activeTab === id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
        padding: '2px 8px', borderRadius: '999px', fontSize: '12px', color: activeTab === id ? '#fff' : 'var(--text-2)'
      }}>
        {count}
      </span>
    </button>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Members Hub</h2>
          <p className="text-muted">Manage memberships, renewals, and leads.</p>
        </div>
        <button onClick={() => navigate('/add-member')} className="btn btn-primary" style={{ display: 'none' /* hidden on mobile, relying on FAB */ }}>
          <Plus size={18} /> New Member
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        <TabButton id="active" label="Active" icon={UserCheck} count={activeMembers.length} />
        <TabButton id="expiring" label="Expiring Soon" icon={Clock} count={expiringMembers.length} />
        <TabButton id="expired" label="Expired" icon={UserX} count={expiredMembers.length} />
        <TabButton id="leads" label="Leads" icon={Users} count={enquiries.length} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search by name, phone, or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px' }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{ 
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                  background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* List View */}
        <div style={{ minHeight: '400px' }}>
          {filteredData.length === 0 ? (
            <div className="empty-state" style={{ border: 'none' }}>
              <Users size={48} />
              <h3>No members found</h3>
              <p>Add your first member to start tracking attendance and managing renewals.</p>
              <button onClick={() => navigate('/add-member')} className="btn btn-primary mt-4">
                <Plus size={18} /> Add Member
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredData.map(item => (
                <div key={item.id} style={{ 
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '16px 20px', borderBottom: '1px solid var(--border)', gap: '16px' 
                }}>
                  
                  {/* Avatar & Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '18px' }}>
                      {item.memberName ? item.memberName[0] : (item.name ? item.name[0] : '?')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '15px' }}>{item.memberName || item.name}</div>
                      <div style={{ color: 'var(--text-2)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={12} /> {item.phone || 'N/A'}
                        {item.shortId && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>ID: {item.shortId}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status & Expiry */}
                  <div style={{ minWidth: '120px' }}>
                    {activeTab !== 'leads' ? (
                      <>
                        <div style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase' }}>Expires</div>
                        <div style={{ 
                          fontSize: '14px', fontWeight: 500,
                          color: activeTab === 'expired' ? 'var(--error)' : activeTab === 'expiring' ? 'var(--warning)' : 'var(--text)' 
                        }}>
                          {new Date(item.membershipEndDate).toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase' }}>Status</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--primary)' }}>{item.status || 'New Lead'}</div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    {(activeTab === 'expiring' || activeTab === 'expired') && (
                      <button 
                        className="btn" 
                        style={{ background: 'var(--success)', color: '#fff', padding: '6px 12px', fontSize: '13px' }}
                        onClick={() => navigate('/renewals')}
                      >
                        Renew
                      </button>
                    )}
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => setSelectedMember(item)}
                    >
                      View Profile
                    </button>
                  </div>

                </div>
              ))}
            </div>
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
