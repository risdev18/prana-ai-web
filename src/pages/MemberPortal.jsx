import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ArrowLeft, Building2, ChevronRight, AlertCircle, Lock } from 'lucide-react';
import { findGymByName, getMembersByGymId, updateMember } from '../services/firestoreService';

const MemberPortal = () => {
  const navigate = useNavigate();

  // Step 1: Find gym by name
  const [gymSearch, setGymSearch] = useState('');
  const [gymResults, setGymResults] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Step 2: Find member in gym
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [membersLoading, setMembersLoading] = useState(false);

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

  // Step 3: Authenticate
  const [authMember, setAuthMember] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
        // Create password
        const updatedMember = { ...authMember, password: pinInput };
        await updateMember(selectedGym.gymId, updatedMember);
        navigate('/member-dashboard', { state: { member: updatedMember, gym: selectedGym } });
      } else {
        // Verify password
        if (authMember.password === pinInput) {
          navigate('/member-dashboard', { state: { member: authMember, gym: selectedGym } });
        } else {
          setPinError('Incorrect password');
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

  const getBmiColor = (bmi) => {
    if (!bmi) return '#6366f1';
    if (bmi < 18.5) return '#06b6d4';
    if (bmi < 25) return '#06d6a0';
    if (bmi < 30) return '#f59e0b';
    return '#f43f5e';
  };

  const filteredMembers = members.filter(m =>
    m.memberName.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: '24px 20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* BG Image */}
      <div style={{
         position: 'fixed', inset: 0,
         backgroundImage: 'url("https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop")',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         opacity: 0.2,
         filter: 'contrast(1.2) grayscale(0.2)',
         mixBlendMode: 'screen',
         pointerEvents: 'none', zIndex: 0
      }} />

      {/* BG Orb */}
      <div style={{
        position: 'fixed', top: '-15%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,214,160,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ width: '100%', maxWidth: '480px', zIndex: 1 }}>
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-2)',
            cursor: 'pointer', marginBottom: '28px', fontSize: '0.9rem',
            fontFamily: 'var(--font)', padding: '8px 16px', borderRadius: '10px',
            backdropFilter: 'blur(10px)'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }} className="animate-fade-up">
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #06d6a0, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 30px rgba(6,214,160,0.4)'
          }}>
            <Users size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-head)', marginBottom: '6px', color: '#fff' }}>
            Member Portal
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1rem' }}>
            Search your gym to view your profile & fitness plan
          </p>
        </div>

        {/* ─── STEP 1: Search Gym ─── */}
        {!selectedGym && (
          <div className="animate-fade-up">
            <div className="card-glass-green" style={{
              borderRadius: '24px', padding: '32px',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '20px', padding: '10px 16px',
                background: 'rgba(6,214,160,0.08)',
                border: '1px solid rgba(6,214,160,0.2)',
                borderRadius: '10px', fontSize: '0.85rem', color: 'var(--accent)'
              }}>
                <Building2 size={16} />
                Step 1: Enter your gym name
              </div>

              <form onSubmit={handleSearchGym}>
                <div className="form-group">
                  <label>Gym Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-3)'
                    }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Muscle Factory"
                      style={{ paddingLeft: '44px' }}
                      value={gymSearch}
                      onChange={e => setGymSearch(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {searchError && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(244,63,94,0.1)',
                    border: '1px solid rgba(244,63,94,0.25)',
                    borderRadius: '10px', padding: '12px 14px',
                    color: 'var(--error)', fontSize: '0.87rem', marginBottom: '16px'
                  }}>
                    <AlertCircle size={16} /> {searchError}
                  </div>
                )}

                <button
                  type="submit" disabled={searchLoading}
                  className="btn btn-green"
                >
                  {searchLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} />
                      Searching...
                    </span>
                  ) : (
                    <><Search size={16} /> Search Gym</>
                  )}
                </button>
              </form>

              {/* Gym results */}
              {gymResults.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', marginBottom: '10px', fontWeight: 600 }}>
                    {gymResults.length} GYM{gymResults.length > 1 ? 'S' : ''} FOUND
                  </p>
                  {gymResults.map(gym => (
                    <div
                      key={gym.gymId}
                      onClick={() => handleSelectGym(gym)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 16px', borderRadius: '12px',
                        background: 'rgba(6,214,160,0.06)',
                        border: '1px solid rgba(6,214,160,0.2)',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        marginBottom: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,214,160,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,214,160,0.06)'}
                    >
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #06d6a0, #0891b2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <Building2 size={20} color="#fff" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{gym.gymName}</div>
                        <div style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>
                          Owner: {gym.ownerName}
                        </div>
                      </div>
                      <ChevronRight size={18} color="var(--accent)" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP 2: Select Member ─── */}
        {selectedGym && (
          <div className="animate-fade-up">
            {/* Selected Gym Info */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(6,214,160,0.15), rgba(8,145,178,0.08))',
              border: '1px solid rgba(6,214,160,0.3)',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #06d6a0, #0891b2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Building2 size={20} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fff' }}>{selectedGym.gymName}</div>
                <div style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>✓ Gym selected</div>
              </div>
              <button
                onClick={() => { setSelectedGym(null); setGymResults([]); setGymSearch(''); }}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-3)',
                  cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font)'
                }}
              >
                Change
              </button>
            </div>

            <div className="card-glass-blue" style={{
              borderRadius: '24px', padding: '32px',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '16px', padding: '10px 16px',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '10px', fontSize: '0.85rem', color: 'var(--primary-light)'
              }}>
                <Users size={16} />
                Step 2: Select your name from the list
              </div>

              {/* Step 3: Auth or Member List */}
              {authMember ? (
                <div className="animate-fade-up">
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '16px', padding: '10px 16px',
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '10px', fontSize: '0.85rem', color: 'var(--gold)'
                  }}>
                    <Lock size={16} />
                    Step 3: {authMember.password ? 'Enter your password' : 'Create a password'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${getBmiColor(authMember.bmi)}, #6366f1)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: '#fff', fontSize: '0.95rem'
                    }}>
                      {getInitials(authMember.memberName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{authMember.memberName}</div>
                      <div style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>
                        {authMember.password ? 'Welcome back! Please unlock your profile.' : 'First time login. Please set a password.'}
                      </div>
                    </div>
                  </div>

                  {pinError && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
                      borderRadius: '10px', padding: '12px 14px',
                      color: 'var(--error)', fontSize: '0.87rem', marginBottom: '16px'
                    }}>
                      <AlertCircle size={16} /> {pinError}
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit}>
                    <div className="form-group">
                      <label>Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{
                          position: 'absolute', left: '14px', top: '50%',
                          transform: 'translateY(-50%)', color: 'var(--text-3)'
                        }} />
                        <input
                          type="password"
                          className="form-control"
                          placeholder={authMember.password ? "Enter password" : "Create new password"}
                          style={{ paddingLeft: '44px' }}
                          value={pinInput}
                          onChange={e => setPinInput(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => setAuthMember(null)}
                        className="btn"
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid var(--border)' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit" disabled={authLoading}
                        className="btn btn-primary"
                        style={{ flex: 2 }}
                      >
                        {authLoading ? 'Verifying...' : authMember.password ? 'Unlock Profile' : 'Save & Continue'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* Member search */}
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={16} style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-3)'
                    }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search your name..."
                      style={{ paddingLeft: '40px' }}
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                    />
                  </div>

                  {membersLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                      <div className="spinner" />
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                      {members.length === 0
                        ? '🏋️ No members registered in this gym yet.'
                        : '🔍 No member found with that name.'}
                    </div>
                  ) : (
                    filteredMembers.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMember(m)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '14px 16px', borderRadius: '12px',
                          border: '1px solid var(--border)',
                          background: 'rgba(255,255,255,0.02)',
                          cursor: 'pointer', transition: 'all 0.2s ease',
                          marginBottom: '8px'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                      >
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg, ${getBmiColor(m.bmi)}, #6366f1)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: '#fff', fontSize: '0.95rem'
                        }}>
                          {getInitials(m.memberName)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{m.memberName}</div>
                          <div style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>
                            Goal: {m.goal} • BMI: <span style={{ color: getBmiColor(m.bmi) }}>{m.bmi?.toFixed(1)}</span>
                          </div>
                        </div>
                        {m.password ? <Lock size={16} color="var(--gold)" /> : <ChevronRight size={18} color="var(--text-3)" />}
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberPortal;
