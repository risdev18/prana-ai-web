import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToStaff, addStaff } from '../services/firestoreService';
import { Dumbbell, Plus, User, Phone, CheckCircle, CreditCard, X, MessageCircle, Edit3, MoreVertical, ShieldCheck } from 'lucide-react';
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
          <h2 style={{ fontWeight: 700 }}>Staff & Trainers</h2>
          <p className="text-muted" style={{ fontWeight: 500 }}>Manage your gym's team and specialties.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> <span className="hide-mobile">Add Staff</span>
        </button>
      </div>

      {isAdding && (
        <div className="card mb-6 animate-fade-up">
          <h3 style={{ fontWeight: 700 }}>Add New Staff</h3>
          <form onSubmit={handleAddStaff} className="grid-2 gap-3 mt-4">
            <div className="form-group mb-0">
              <label style={{ fontWeight: 600 }}>Name</label>
              <input type="text" className="form-control" required value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} style={{ fontWeight: 500 }} />
            </div>
            <div className="form-group mb-0">
              <label style={{ fontWeight: 600 }}>Phone Number</label>
              <input type="tel" className="form-control" required value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} style={{ fontWeight: 500 }} />
            </div>
            <div className="form-group mb-0">
              <label style={{ fontWeight: 600 }}>Role</label>
              <select className="form-control" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} style={{ fontWeight: 500 }}>
                <option value="Trainer">Trainer</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label style={{ fontWeight: 600 }}>Specialty (Optional)</label>
              <input type="text" className="form-control" placeholder="e.g. Weight Loss, CrossFit" value={newStaff.specialty} onChange={e => setNewStaff({...newStaff, specialty: e.target.value})} style={{ fontWeight: 500 }} />
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
          <h3 className="mt-4" style={{ fontWeight: 700 }}>No staff added yet</h3>
          <p style={{ fontWeight: 500 }}>Add your first trainer or receptionist to start delegating tasks.</p>
          <button className="btn btn-outline mt-4" onClick={() => setIsAdding(true)}>
            <Plus size={18} /> Add Staff
          </button>
        </div>
      ) : (
        <div className="grid-3 gap-4">
          {staff.map(s => (
            <div key={s.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s ease', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="flex items-center gap-3">
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, border: '1px solid rgba(124,92,255,0.3)' }}>
                  {s.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{s.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted" style={{ fontWeight: 500 }}>
                <Phone size={14} /> {s.phone}
              </div>
              {s.specialty && (
                <div className="flex items-center gap-2 text-sm text-muted" style={{ fontWeight: 500 }}>
                  <CheckCircle size={14} color="var(--success)" /> {s.specialty}
                </div>
              )}
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="btn btn-ghost w-full" style={{ fontSize: '13px', fontWeight: 600 }}>Assign Members</button>
                <button 
                  className="btn btn-outline w-full" 
                  style={{ fontSize: '13px', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 600 }}
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
          <style>{`
            @keyframes shimmer {
              0% { left: -100%; }
              100% { left: 200%; }
            }
            @keyframes qr-pulse {
              0% { box-shadow: 0 0 5px rgba(124, 92, 255, 0.2); }
              50% { box-shadow: 0 0 15px rgba(124, 92, 255, 0.6); }
              100% { box-shadow: 0 0 5px rgba(124, 92, 255, 0.2); }
            }
          `}</style>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ══ MEMBERSHIP CARD ══ */}
            <div 
              style={{
                width: '100%', aspectRatio: '1.75 / 1', borderRadius: '24px',
                overflow: 'hidden', position: 'relative',
                background: '#090b14', 
                backgroundImage: 'linear-gradient(135deg, #0a0c14 0%, #0f1620 45%, #0b0e1a 100%)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px rgba(124, 92, 255,0.1)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                animation: 'flip-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 45px 110px rgba(0,0,0,0.9), 0 0 0 1px rgba(140,100,255,0.25), 0 10px 40px rgba(120,80,255,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px rgba(124, 92, 255,0.1)';
              }}
            >
              {/* Glossy top edge shine (3% white) */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.03)', zIndex: 2 }} />
              {/* Subtle glass overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 1 }} />
              {/* Abstract gradient mesh background */}
              <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(124, 92, 255, 0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

              {/* Left animated accent bar - Purple for staff */}
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px', background: 'linear-gradient(180deg, #7c5cff 0%, #6366f1 50%, #4338ca 100%)', borderRadius: '24px 0 0 24px', boxShadow: '2px 0 15px rgba(124,92,255,0.4)', zIndex: 2 }} />

              {/* TOP ROW: Gym name left + Instant Actions right */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '24px 28px 0 32px', zIndex: 2, position: 'relative' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#7c5cff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>
                    {selectedStaff.role === 'Trainer' ? 'TRAINER ACCESS PASS' : 'STAFF ACCESS PASS'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-head)', letterSpacing: '0.02em', lineHeight: 1 }}>
                    VYRONIX GYM
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Instant Actions */}
                  <a href={`https://wa.me/${selectedStaff.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'background 0.2s', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                    <MessageCircle size={14} />
                  </a>
                  <button style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                    <Edit3 size={14} />
                  </button>
                  <button style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>

              {/* MIDDLE ROW: Avatar + Info + QR */}
              <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr 75px', gap: '24px', alignItems: 'center', padding: '10px 28px 24px 32px', zIndex: 2, position: 'relative' }}>
                
                {/* Photo box */}
                <div style={{ position: 'relative', height: '100px' }}>
                  <div style={{ width: '85px', height: '100px', borderRadius: '12px', overflow: 'hidden', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(124,92,255,0.2)', border: '1px solid rgba(124,92,255,0.3)' }}>
                    {selectedStaff.photoUrl ? (
                      <img src={selectedStaff.photoUrl} alt={selectedStaff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#818cf8', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {selectedStaff.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label title="Upload photo" style={{ position: 'absolute', inset: 0, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', opacity: 0, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.6rem', color: '#7c5cff', fontWeight: 600, textAlign: 'center', letterSpacing: '0.05em' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                    📷<br/>CHANGE
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* Details */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-head)', letterSpacing: '0.02em', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedStaff.name}
                    </div>
                    {/* STATUS BADGE - Slow Shimmer */}
                    <div style={{ 
                      padding: '3px 8px', borderRadius: '6px', background: 'rgba(124,92,255,0.15)', border: '1px solid rgba(124,92,255,0.3)', color: '#7c5cff', fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.1em',
                      position: 'relative', overflow: 'hidden'
                    }}>
                      ACTIVE
                      <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmer 8s infinite' }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginTop: '16px' }}>
                    {[
                      { label: 'ROLE', value: selectedStaff.role, color: '#fff' },
                      { label: 'STAFF ID', value: selectedStaff.id.substring(0, 8).toUpperCase(), color: '#7c5cff' },
                      { label: 'PHONE', value: selectedStaff.phone || 'N/A', color: '#fff' },
                      { label: 'JOINED', value: selectedStaff.createdAt ? new Date(selectedStaff.createdAt).toLocaleDateString('en-GB') : 'N/A', color: '#fff' },
                    ].map(d => (
                      <div key={d.label}>
                        <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2px', fontWeight: 400 }}>{d.label}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: d.color, fontFamily: d.label === 'STAFF ID' ? 'monospace' : 'inherit' }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', fontWeight: 600 }}>SCAN TO VERIFY</div>
                  {/* QR Container with Pulse */}
                  <div style={{ 
                    background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    position: 'relative'
                  }}>
                    {/* Container Glow Pulse */}
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '12px', boxShadow: '0 0 15px rgba(124, 92, 255, 0.4)', animation: 'qr-pulse 3s infinite', zIndex: 0 }} />
                    <div style={{ background: '#fff', padding: '4px', borderRadius: '8px', position: 'relative', zIndex: 1 }}>
                      <QRCode value={selectedStaff.id || 'unknown'} size={60} level="Q" fgColor="#000" bgColor="#fff" style={{ display: 'block' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.45rem', color: '#7c5cff', fontWeight: 600 }}>
                    <ShieldCheck size={10} /> VERIFIED
                  </div>
                </div>
              </div>

              {/* Bottom purple accent strip */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #7c5cff 0%, #6366f1 40%, transparent 100%)', zIndex: 2, position: 'relative' }} />
            </div>

            {/* Add photo prompt if no photo */}
            {!selectedStaff.photoUrl && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', borderRadius: '16px', cursor: 'pointer', background: 'rgba(124,92,255,0.08)', border: '1px dashed rgba(124,92,255,0.3)', color: '#7c5cff', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(124,92,255,0.05)' }}>
                📷 Tap here to add a photo to this staff card
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}

            {/* Close button */}
            <button onClick={() => setShowCard(false)} style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', fontFamily: 'var(--font)', backdropFilter: 'blur(10px)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              Close Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainers;
