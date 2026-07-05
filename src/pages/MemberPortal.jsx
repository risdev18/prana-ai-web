import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ArrowLeft, Building2, ChevronRight, AlertCircle, Lock, Zap, CheckCircle, Phone } from 'lucide-react';
import { findGymByName, getMembersByGymId, updateMember } from '../services/firestoreService';

const StepIndicator = ({ step, total }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', fontSize: '12px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: i + 1 <= step ? 'linear-gradient(135deg, #7C5CFF, #5DA9FF)' : 'rgba(255,255,255,0.05)',
          border: i + 1 <= step ? 'none' : '1px solid var(--border)',
          color: i + 1 <= step ? '#fff' : 'var(--text-3)',
          boxShadow: i + 1 === step ? '0 0 16px rgba(124,92,255,0.4)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          {i + 1 < step ? <CheckCircle size={14} /> : i + 1}
        </div>
        {i < total - 1 && (
          <div style={{ flex: 1, height: '2px', background: i + 1 < step ? 'var(--primary)' : 'rgba(255,255,255,0.06)', borderRadius: '999px', transition: 'background 0.3s ease' }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

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
  const [verifyPhoneInput, setVerifyPhoneInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const currentStep = !selectedGym ? 1 : !authMember ? 2 : 3;

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
    } catch {
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
    setVerifyPhoneInput('');
    setPinError('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setPinError('');

    if (!authMember.password) {
      const expectedPhone = (authMember.phone || '').replace(/\D/g, '');
      const inputPhone = verifyPhoneInput.replace(/\D/g, '');
      if (expectedPhone && inputPhone !== expectedPhone) {
        return setPinError('The phone number entered does not match our records.');
      }
      if (!expectedPhone && inputPhone.length < 10) {
        return setPinError('Please enter a valid 10-digit phone number.');
      }
    }

    if (pinInput.length < 4) return setPinError('Password must be at least 4 characters');
    setAuthLoading(true);
    try {
      if (!authMember.password) {
        // IMPORTANT: Only send password + phone fields.
        // Firestore security rule only allows unauthenticated updates
        // if affectedKeys().hasOnly(['password', 'phone']).
        // Spreading the full member object would fail the rule.
        const patch = { password: pinInput };
        if (!authMember.phone && verifyPhoneInput) {
          patch.phone = verifyPhoneInput;
        }
        await updateMember(selectedGym.gymId, { ...patch, memberId: authMember.memberId });
        // Build the full updated member for navigation state (local only)
        const updatedMember = { ...authMember, ...patch };
        navigate('/member-dashboard', { state: { member: updatedMember, gym: selectedGym } });
      } else {
        if (authMember.password === pinInput) {
          navigate('/member-dashboard', { state: { member: authMember, gym: selectedGym } });
        } else {
          setPinError('Incorrect password. Please try again.');
        }
      }
    } catch (err) {
      console.error('Member portal update error:', err);
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
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-15%', left: '-10%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-15%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>
        {/* Back button */}
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ marginBottom: '28px', padding: '8px 12px', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #7C5CFF 0%, #00D4FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 28px rgba(124,92,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
            <Users size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px', fontFamily: 'var(--font-head)' }}>Member Portal</h1>
          <p style={{ color: 'var(--text-3)', margin: 0 }}>Access your fitness profile & personalized plan</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(15,12,38,0.7)', border: '1px solid rgba(124,92,255,0.18)',
          borderRadius: '24px', padding: '28px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(124,92,255,0.05)',
          position: 'relative'
        }}>
          {/* Progress indicator */}
          <StepIndicator step={currentStep} total={3} />

          {/* Step labels */}
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {currentStep === 1 && <><Building2 size={13} /> Step 1 — Find Your Gym</>}
            {currentStep === 2 && <><Users size={13} /> Step 2 — Select Your Name</>}
            {currentStep === 3 && <><Lock size={13} /> Step 3 — {authMember?.password ? 'Enter Password' : 'Create Password'}</>}
          </div>

          {/* ── STEP 1: Gym Search ── */}
          {!selectedGym && (
            <div>
              <form onSubmit={handleSearchGym}>
                <div className="form-group">
                  <label>Gym Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                    <input
                      type="text" className="form-control" placeholder="e.g. Muscle Factory"
                      style={{ paddingLeft: '44px' }}
                      value={gymSearch} onChange={e => setGymSearch(e.target.value)} required
                    />
                  </div>
                </div>

                {searchError && (
                  <div style={{ background: 'rgba(255,94,126,0.08)', border: '1px solid rgba(255,94,126,0.25)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={15} /> {searchError}
                  </div>
                )}

                <button type="submit" disabled={searchLoading} style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #7C5CFF, #5DA9FF)',
                  color: '#fff', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '14px',
                  cursor: searchLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(124,92,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: searchLoading ? 0.7 : 1, transition: 'all 0.2s'
                }}>
                  {searchLoading ? (
                    <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Searching…</>
                  ) : (
                    <><Search size={16} /> Search Gym</>
                  )}
                </button>
              </form>

              {gymResults.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                    {gymResults.length} Gym{gymResults.length > 1 ? 's' : ''} Found
                  </p>
                  {gymResults.map(gym => (
                    <div key={gym.gymId} onClick={() => handleSelectGym(gym)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 16px', borderRadius: '14px',
                        background: 'rgba(124,92,255,0.05)', border: '1px solid rgba(124,92,255,0.15)',
                        cursor: 'pointer', transition: 'all 0.2s', marginBottom: '8px'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,92,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(124,92,255,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,92,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(124,92,255,0.15)'; e.currentTarget.style.transform = ''; }}
                    >
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #7C5CFF, #5DA9FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(124,92,255,0.3)' }}>
                        <Building2 size={20} color="#fff" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{gym.gymName}</div>
                      </div>
                      <ChevronRight size={18} color="var(--primary-light)" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2 + 3 ── */}
          {selectedGym && (
            <div>
              {/* Selected gym badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '12px', marginBottom: '20px',
                background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #7C5CFF, #5DA9FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={16} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{selectedGym.gymName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--success)' }}>✓ Gym selected</div>
                </div>
                <button onClick={() => { setSelectedGym(null); setGymResults([]); setGymSearch(''); setAuthMember(null); }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600 }}>
                  Change
                </button>
              </div>

              {/* Member selection */}
              {!authMember ? (
                <div>
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                    <input
                      type="text" className="form-control" placeholder="Search your name…"
                      style={{ paddingLeft: '40px' }}
                      value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                    />
                  </div>

                  {membersLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                      <div className="spinner" />
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
                      {members.length === 0 ? 'No members found in this gym.' : 'No member found with that name.'}
                    </div>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {filteredMembers.map(m => (
                        <div key={m.id} onClick={() => handleSelectMember(m)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 14px', borderRadius: '12px',
                            border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,92,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,92,255,0.3)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
                        >
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(124,92,255,0.3), rgba(0,212,255,0.2))',
                            border: '1px solid rgba(124,92,255,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, color: 'var(--primary-light)', fontSize: '14px', flexShrink: 0
                          }}>
                            {getInitials(m.memberName)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{m.memberName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>ID: {m.shortId}</div>
                          </div>
                          {m.password ? <Lock size={15} color="var(--warning)" /> : <ChevronRight size={16} color="var(--text-3)" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Password auth */
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px', borderRadius: '12px', marginBottom: '20px',
                    background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.2)'
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7C5CFF, #5DA9FF)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: '#fff', fontSize: '16px', flexShrink: 0
                    }}>
                      {getInitials(authMember.memberName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{authMember.memberName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                        {authMember.password ? '🔐 Enter your password' : '🔑 First time? Create a password'}
                      </div>
                    </div>
                  </div>

                  {pinError && (
                    <div style={{ background: 'rgba(255,94,126,0.08)', border: '1px solid rgba(255,94,126,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={14} /> {pinError}
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit}>
                    {!authMember.password && (
                      <div className="form-group">
                        <label>Verify Registered Phone Number</label>
                        <div style={{ position: 'relative' }}>
                          <Phone size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                          <input
                            type="tel" className="form-control"
                            placeholder="Enter your 10-digit phone number"
                            style={{ paddingLeft: '44px', marginBottom: '16px' }}
                            value={verifyPhoneInput} onChange={e => setVerifyPhoneInput(e.target.value)} required
                            autoFocus
                          />
                        </div>
                      </div>
                    )}
                    <div className="form-group">
                      <label>{authMember.password ? 'Your Password' : 'Create a Password'}</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                        <input
                          type="password" className="form-control"
                          placeholder={authMember.password ? 'Enter your password' : 'Create a password (min 4 chars)'}
                          style={{ paddingLeft: '44px' }}
                          value={pinInput} onChange={e => setPinInput(e.target.value)} required
                          autoFocus={!!authMember.password}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <button type="button" onClick={() => setAuthMember(null)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                      <button type="submit" disabled={authLoading} style={{
                        flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
                        background: 'linear-gradient(135deg, #7C5CFF, #5DA9FF)',
                        color: '#fff', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '14px',
                        cursor: authLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        opacity: authLoading ? 0.7 : 1, transition: 'all 0.2s'
                      }}>
                        {authLoading ? (
                          <><div style={{ width: '17px', height: '17px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Verifying…</>
                        ) : (
                          <><Zap size={16} /> {authMember.password ? 'Unlock Profile' : 'Save & Continue'}</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Powered By Watermark */}
        <div style={{ textAlign: 'center', marginTop: '24px', opacity: 0.6 }}>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.05em' }}>
            Powered by <strong style={{ color: 'var(--primary-light)' }}>Ombrix Mitra</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberPortal;
