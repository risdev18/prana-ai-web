import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToStaff, addStaff } from '../services/firestoreService';
import { Dumbbell, Plus, User, Phone, CheckCircle, CreditCard, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import { updateStaff } from '../services/firestoreService';

const Trainers = () => {
  const { currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', role: 'Trainer', specialty: '' });
  
  // ID Card State
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showCard, setShowCard] = useState(false);

  const handlePhotoUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedStaff) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Photo = event.target.result;
      try {
        await updateStaff(currentUser.uid, selectedStaff.id, { photoUrl: base64Photo });
        setSelectedStaff({ ...selectedStaff, photoUrl: base64Photo });
      } catch (err) {
        console.error("Failed to upload photo", err);
      }
    };
    reader.readAsDataURL(file);
  };


  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToStaff(currentUser.uid, setStaff);
      return () => unsub();
    }
  }, [currentUser]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.phone) return;
    await addStaff(currentUser.uid, newStaff);
    setIsAdding(false);
    setNewStaff({ name: '', phone: '', role: 'Trainer', specialty: '' });
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Staff & Trainers</h2>
          <p className="text-muted">Manage your gym's team and specialties.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> <span className="hide-mobile">Add Staff</span>
        </button>
      </div>

      {isAdding && (
        <div className="card mb-6 animate-fade-up">
          <h3>Add New Staff</h3>
          <form onSubmit={handleAddStaff} className="grid-2 gap-3 mt-4">
            <div className="form-group mb-0">
              <label>Name</label>
              <input type="text" className="form-control" required value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
            </div>
            <div className="form-group mb-0">
              <label>Phone Number</label>
              <input type="tel" className="form-control" required value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} />
            </div>
            <div className="form-group mb-0">
              <label>Role</label>
              <select className="form-control" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                <option value="Trainer">Trainer</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label>Specialty (Optional)</label>
              <input type="text" className="form-control" placeholder="e.g. Weight Loss, CrossFit" value={newStaff.specialty} onChange={e => setNewStaff({...newStaff, specialty: e.target.value})} />
            </div>
            <div className="grid-2" style={{ gridColumn: '1 / -1', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Staff</button>
            </div>
          </form>
        </div>
      )}

      {staff.length === 0 && !isAdding ? (
        <div className="empty-state border-none">
          <Dumbbell size={48} />
          <h3 className="mt-4">No staff added yet</h3>
          <p>Add your first trainer or receptionist to start delegating tasks.</p>
          <button className="btn btn-outline mt-4" onClick={() => setIsAdding(true)}>
            <Plus size={18} /> Add Staff
          </button>
        </div>
      ) : (
        <div className="grid-3 gap-4">
          {staff.map(s => (
            <div key={s.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600 }}>
                  {s.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone size={14} /> {s.phone}
              </div>
              {s.specialty && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <CheckCircle size={14} color="var(--success)" /> {s.specialty}
                </div>
              )}
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="btn btn-ghost w-full" style={{ fontSize: '13px' }}>Assign Members</button>
                <button 
                  className="btn btn-outline w-full" 
                  style={{ fontSize: '13px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  onClick={() => { setSelectedStaff(s); setShowCard(true); }}
                >
                  <CreditCard size={14} style={{ marginRight: '4px' }} /> ID Card
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── DIGITAL STAFF ID CARD MODAL ─── */}
      {showCard && selectedStaff && (
        <div
          onClick={() => setShowCard(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', perspective: '1200px'
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ══ MEMBERSHIP CARD ══ */}
            <div style={{
              width: '100%', aspectRatio: '1.65 / 1', borderRadius: '24px',
              overflow: 'hidden', position: 'relative',
              background: '#090b14', 
              backgroundImage: 'radial-gradient(at 0% 0%, rgba(124, 92, 255, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0, 255, 136, 0.15) 0px, transparent 50%), linear-gradient(135deg, #0a0c14 0%, #0f1620 45%, #0b0e1a 100%)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px rgba(124, 92, 255,0.1)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              animation: 'flip-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>

              {/* Glossy top shine */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)', pointerEvents: 'none' }} />

              {/* Left animated accent bar - Purple for staff */}
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px', background: 'linear-gradient(180deg, #7c5cff 0%, #6366f1 50%, #4338ca 100%)', borderRadius: '24px 0 0 24px', boxShadow: '2px 0 15px rgba(124,92,255,0.4)' }} />

              {/* Watermark logo */}
              <div style={{ position: 'absolute', right: '15%', top: '50%', transform: 'translateY(-50%)', fontSize: '6rem', opacity: 0.03, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>⚡</div>

              {/* TOP ROW: Gym name left + logo right */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 0 32px' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#7c5cff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px', textShadow: '0 0 10px rgba(124,92,255,0.5)' }}>
                    {selectedStaff.role === 'Trainer' ? 'TRAINER ACCESS PASS' : 'STAFF ACCESS PASS'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-head)', letterSpacing: '0.02em', lineHeight: 1 }}>
                    VYRONIX GYM
                  </div>
                </div>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c5cff, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(124,92,255,0.4)' }}>
                  <Dumbbell size={22} color="#fff" strokeWidth={2.5} />
                </div>
              </div>

              {/* MIDDLE ROW: Photo + Details + QR */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '10px 28px 24px 32px' }}>

                {/* Photo box with solid bg and glow */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '75px', height: '85px', borderRadius: '12px', border: '2px solid rgba(124,92,255,0.8)', overflow: 'hidden', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(124,92,255,0.3)' }}>
                    {selectedStaff.photoUrl ? (
                      <img src={selectedStaff.photoUrl} alt={selectedStaff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={30} color="rgba(255,255,255,0.4)" />
                    )}
                  </div>
                  <label title="Upload photo" style={{ position: 'absolute', inset: 0, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', opacity: 0, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.55rem', color: '#7c5cff', fontWeight: 800, textAlign: 'center', letterSpacing: '0.05em' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                    📷<br/>CHANGE
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-head)', letterSpacing: '0.02em', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedStaff.name}
                    </div>
                    {/* STATUS BADGE */}
                    <div style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(124,92,255,0.15)', border: '1px solid rgba(124,92,255,0.3)', color: '#7c5cff', fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.1em', boxShadow: '0 0 10px rgba(124,92,255,0.2)' }}>
                      ACTIVE
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginTop: '12px' }}>
                    {[
                      { label: 'STAFF ID', value: selectedStaff.id.substring(0, 8).toUpperCase(), color: '#7c5cff' },
                      { label: 'ROLE', value: selectedStaff.role, color: '#fff' },
                      { label: 'PHONE', value: selectedStaff.phone || 'N/A', color: '#fff' },
                      { label: 'JOINED', value: selectedStaff.createdAt ? new Date(selectedStaff.createdAt).toLocaleDateString('en-GB') : 'N/A', color: '#fff' },
                    ].map(d => (
                      <div key={d.label}>
                        <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2px' }}>{d.label}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: d.color, fontFamily: d.label === 'STAFF ID' ? 'monospace' : 'inherit' }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginRight: '-4px' }}>
                  <div style={{ background: '#fff', padding: '6px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.15)' }}>
                    <QRCode value={selectedStaff.id || 'unknown'} size={60} level="Q" fgColor="#000" bgColor="#fff" style={{ display: 'block' }} />
                  </div>
                  <div style={{ fontSize: '0.4rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', fontWeight: 700 }}>SCAN TO VERIFY</div>
                </div>
              </div>

              {/* Bottom purple accent strip */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #7c5cff 0%, #6366f1 40%, transparent 100%)' }} />
            </div>

            {/* Add photo prompt if no photo */}
            {!selectedStaff.photoUrl && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', borderRadius: '16px', cursor: 'pointer', background: 'rgba(124,92,255,0.08)', border: '1px dashed rgba(124,92,255,0.3)', color: '#7c5cff', fontSize: '0.9rem', fontWeight: 700, transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(124,92,255,0.05)' }}>
                📷 Tap here to add a photo to this staff card
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}

            {/* Close button */}
            <button onClick={() => setShowCard(false)} style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', fontFamily: 'var(--font)', backdropFilter: 'blur(10px)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              Close Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainers;
