import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ArrowLeft, Building2, ChevronRight, AlertCircle, Lock } from 'lucide-react';
import { findGymByName, getMembersByGymId, updateMember } from '../services/firestoreService';

const MemberPortal = () => {
  const navigate = useNavigate();

  const [gymSearch, setGymSearch] = useState('');
  const [gymResults, setGymResults] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [membersLoading, setMembersLoading] = useState(false);

  const [authMember, setAuthMember] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleSearchGym = async (e) => {
    e.preventDefault();
    if (!gymSearch.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setGymResults([]);
    try {
      const results = await findGymByName(gymSearch.trim());
      if (results.length === 0) {
        setSearchError('No gym found with that name. Check spelling and try again.');
      } else {
        setGymResults(results);
      }
    } catch (err) {
      setSearchError('Error searching. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectGym = async (gym) => {
    setSelectedGym(gym);
    setMembersLoading(true);
    try {
      const data = await getMembersByGymId(gym.gymId);
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleSelectMember = (member) => {
    setAuthMember(member);
    setPinInput('');
    setPinError('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setPinError('');
    if (pinInput.length < 4) return setPinError('Password must be at least 4 characters');
    setAuthLoading(true);
    try {
      if (!authMember.password) {
        const updatedMember = { ...authMember, password: pinInput };
        await updateMember(selectedGym.gymId, updatedMember);
        navigate('/member-dashboard', { state: { member: updatedMember, gym: selectedGym } });
      } else {
        if (authMember.password === pinInput) {
          navigate('/member-dashboard', { state: { member: authMember, gym: selectedGym } });
        } else {
          setPinError('Incorrect password. Please try again.');
        }
      }
    } catch (err) {
      setPinError('Error updating profile. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const filteredMembers = members.filter(m =>
    m.memberName.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: '24px 20px', background: 'var(--bg)'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost"
          style={{ marginBottom: '28px', padding: '8px 12px', gap: '6px' }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'var(--primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Users size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Member Portal</h1>
          <p className="text-muted">Find your gym to view your profile and fitness plan.</p>
        </div>

        {/* STEP 1: Search Gym */}
        {!selectedGym && (
          <div className="card animate-fade-up">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--text-3)', marginBottom: '20px'
            }}>
              <Building2 size={14} /> Step 1 of 3 — Find Your Gym
            </div>

            <form onSubmit={handleSearchGym}>
              <div className="form-group">
                <label>Gym Name</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="text" className="form-control"
                    placeholder="e.g. Muscle Factory" style={{ paddingLeft: '44px' }}
                    value={gymSearch} onChange={e => setGymSearch(e.target.value)} required
                  />
                </div>
              </div>

              {searchError && (
                <div className="badge badge-red mb-4 w-full justify-start p-3 text-sm gap-2">
                  <AlertCircle size={16} /> {searchError}
                </div>
              )}

              <button type="submit" disabled={searchLoading} className="btn btn-primary w-full">
                {searchLoading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Searching...</> : <><Search size={16} /> Search Gym</>}
              </button>
            </form>

            {gymResults.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <p className="text-muted text-sm mb-3">{gymResults.length} gym{gymResults.length > 1 ? 's' : ''} found</p>
                {gymResults.map(gym => (
                  <div
                    key={gym.gymId} onClick={() => handleSelectGym(gym)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 16px', borderRadius: '12px',
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      cursor: 'pointer', transition: 'border-color 0.2s ease', marginBottom: '8px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{gym.gymName}</div>
                      <div className="text-muted text-sm">Owner: {gym.ownerName}</div>
                    </div>
                    <ChevronRight size={18} color="var(--text-3)" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 + 3: Member Select & Auth */}
        {selectedGym && (
          <div className="animate-fade-up">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
              background: 'var(--bg-card)', border: '1px solid var(--border)'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={18} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{selectedGym.gymName}</div>
                <div style={{ fontSize: '12px', color: 'var(--success)' }}>✓ Gym selected</div>
              </div>
              <button
                onClick={() => { setSelectedGym(null); setGymResults([]); setGymSearch(''); setAuthMember(null); }}
                className="btn btn-ghost" style={{ fontSize: '13px', padding: '4px 8px' }}
              >
                Change
              </button>
            </div>

            <div className="card">
              {authMember ? (
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px',
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--text-3)', marginBottom: '20px'
                  }}>
                    <Lock size={14} /> Step 3 of 3 — {authMember.password ? 'Enter Password' : 'Create Password'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '12px', background: 'var(--bg)', borderRadius: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                      {getInitials(authMember.memberName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{authMember.memberName}</div>
                      <div className="text-muted text-sm">{authMember.password ? 'Welcome back!' : 'First time? Set a password.'}</div>
                    </div>
                  </div>

                  {pinError && (
                    <div className="badge badge-red mb-4 w-full justify-start p-3 text-sm gap-2">
                      <AlertCircle size={16} /> {pinError}
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit}>
                    <div className="form-group">
                      <label>Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                        <input
                          type="password" className="form-control"
                          placeholder={authMember.password ? "Enter your password" : "Create a password (min 4 chars)"}
                          style={{ paddingLeft: '44px' }}
                          value={pinInput} onChange={e => setPinInput(e.target.value)} required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="button" onClick={() => setAuthMember(null)} className="btn btn-outline flex-1">Back</button>
                      <button type="submit" disabled={authLoading} className="btn btn-primary" style={{ flex: 2 }}>
                        {authLoading ? 'Verifying...' : authMember.password ? 'Unlock Profile' : 'Save & Continue'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px',
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--text-3)', marginBottom: '20px'
                  }}>
                    <Users size={14} /> Step 2 of 3 — Select Your Name
                  </div>

                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                    <input
                      type="text" className="form-control" placeholder="Search your name..."
                      style={{ paddingLeft: '40px' }}
                      value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                    />
                  </div>

                  {membersLoading ? (
                    <div className="loader"><div className="spinner" /></div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="text-center text-muted" style={{ padding: '30px 0' }}>
                      {members.length === 0 ? 'No members registered in this gym yet.' : 'No member found with that name.'}
                    </div>
                  ) : (
                    filteredMembers.map(m => (
                      <div
                        key={m.id} onClick={() => handleSelectMember(m)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '14px 16px', borderRadius: '12px',
                          border: '1px solid var(--border)', background: 'var(--bg)',
                          cursor: 'pointer', transition: 'border-color 0.2s ease', marginBottom: '8px'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {getInitials(m.memberName)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{m.memberName}</div>
                          <div className="text-muted text-sm">ID: {m.shortId}</div>
                        </div>
                        {m.password ? <Lock size={16} color="var(--warning)" /> : <ChevronRight size={18} color="var(--text-3)" />}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberPortal;
