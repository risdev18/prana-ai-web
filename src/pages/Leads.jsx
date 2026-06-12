import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToEnquiries, addEnquiry, updateEnquiry } from '../services/firestoreService';
import { MessageCircle, Phone, User, Plus, Search, X, Edit3, Calendar, Clock, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';

const STATUS_CONFIG = {
  'New Inquiry': { color: '#5DA9FF', bg: 'rgba(93,169,255,0.08)', border: 'rgba(93,169,255,0.2)', icon: '🆕', label: 'New Inquiry' },
  'Trial':       { color: '#FFD043', bg: 'rgba(255,208,67,0.08)',  border: 'rgba(255,208,67,0.2)',  icon: '🔬', label: 'Trial' },
  'Follow-up':   { color: '#7C5CFF', bg: 'rgba(124,92,255,0.08)', border: 'rgba(124,92,255,0.2)', icon: '📞', label: 'Follow-up' },
  'Converted':   { color: '#00E676', bg: 'rgba(0,230,118,0.08)',  border: 'rgba(0,230,118,0.2)',  icon: '✅', label: 'Converted' },
};

const SOURCE_CONFIG = {
  'Walk-in':    { icon: '🚶', color: '#00D4FF' },
  'Instagram':  { icon: '📸', color: '#E1306C' },
  'Google Maps':{ icon: '📍', color: '#FFA000' },
  'Referral':   { icon: '🤝', color: '#00E676' },
};

const Leads = () => {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  const [newLead, setNewLead] = useState({
    name: '', phone: '', status: 'New Inquiry', source: 'Walk-in', notes: []
  });

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editSource, setEditSource] = useState('Walk-in');
  const [newNoteText, setNewNoteText] = useState('');
  const [savingLead, setSavingLead] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToEnquiries(currentUser.uid, setLeads);
      return () => unsub();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedLead) {
      setEditName(selectedLead.name || '');
      setEditPhone(selectedLead.phone || '');
      setEditStatus(selectedLead.status || 'New Inquiry');
      setEditSource(selectedLead.source || 'Walk-in');
      setNewNoteText('');
    }
  }, [selectedLead]);

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return;
    await addEnquiry(currentUser.uid, { ...newLead, notes: [] });
    setIsAdding(false);
    setNewLead({ name: '', phone: '', status: 'New Inquiry', source: 'Walk-in', notes: [] });
  };

  const updateStatus = async (id, status) => {
    await updateEnquiry(currentUser.uid, id, { status });
  };

  const handleSaveLeadModal = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    setSavingLead(true);
    try {
      const updatedNotes = [...(selectedLead.notes || [])];
      if (newNoteText.trim()) {
        updatedNotes.push({ text: newNoteText.trim(), date: new Date().toISOString() });
      }
      await updateEnquiry(currentUser.uid, selectedLead.id, {
        name: editName, phone: editPhone, status: editStatus, source: editSource, notes: updatedNotes
      });
      setSelectedLead(null);
    } catch (err) {
      alert('Failed to update lead');
    } finally {
      setSavingLead(false);
    }
  };

  const getWhatsAppLink = (phone, name) => {
    const cleanPhone = phone?.replace(/\D/g, '');
    if (!cleanPhone) return '#';
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(`Hi ${name}, thank you for your enquiry at our gym! Let me know if you have any questions or want to schedule a trial session.`);
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search)
  );

  const statuses = Object.keys(STATUS_CONFIG);
  const totalLeads = leads.length;
  const convertedCount = leads.filter(l => l.status === 'Converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #5DA9FF, #7C5CFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(93,169,255,0.3)'
              }}>
                <TrendingUp size={20} color="#fff" />
              </div>
              <h2 style={{ margin: 0 }}>Lead Pipeline</h2>
            </div>
            <p style={{ margin: 0, color: 'var(--text-3)' }}>CRM board — track inquiries from contact to conversion</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)} style={{ gap: '8px' }}>
            <Plus size={18} /> Add Lead
          </button>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Leads', value: totalLeads, color: '#5DA9FF' },
            { label: 'Converted', value: convertedCount, color: '#00E676' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, color: '#7C5CFF' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '12px 20px',
              backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-head)' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Lead Form ── */}
      {isAdding && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid rgba(93,169,255,0.3)',
          borderRadius: '20px', padding: '24px', marginBottom: '24px',
          backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(93,169,255,0.1)',
          animation: 'fadeUp 0.3s ease both'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#5DA9FF" />
              <h3 style={{ margin: 0, color: '#5DA9FF' }}>Add New Enquiry</h3>
            </div>
            <button onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAddLead} className="grid-4" style={{ gap: '12px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Full Name</label>
              <input type="text" className="form-control" placeholder="e.g. Rahul Sharma" required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Phone Number</label>
              <input type="tel" className="form-control" placeholder="9876543210" required value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Lead Source</label>
              <select className="form-control" value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})}>
                {Object.keys(SOURCE_CONFIG).map(s => <option key={s} value={s}>{SOURCE_CONFIG[s].icon} {s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsAdding(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Lead</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Search ── */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '380px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input
          type="text" className="form-control" placeholder="Search by name or phone…"
          style={{ paddingLeft: '42px' }}
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Kanban Board ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', overflowX: 'auto', paddingBottom: '16px', minWidth: '900px' }}>
        {statuses.map(status => {
          const cfg = STATUS_CONFIG[status];
          const colLeads = filteredLeads.filter(l => l.status === status);
          return (
            <div key={status} style={{
              background: 'rgba(15,12,38,0.5)',
              border: `1px solid ${cfg.border}`,
              borderRadius: '20px', padding: '16px',
              backdropFilter: 'blur(16px)',
              boxShadow: `0 4px 24px ${cfg.bg}`
            }}>
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${cfg.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{cfg.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{status}</span>
                </div>
                <div style={{
                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                  borderRadius: '999px', padding: '2px 10px', fontSize: '11px', fontWeight: 800
                }}>{colLeads.length}</div>
              </div>

              {/* Lead Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {colLeads.map(lead => {
                  const src = SOURCE_CONFIG[lead.source] || { icon: '📌', color: '#7C5CFF' };
                  return (
                    <div key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      style={{
                        background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.border}`,
                        borderRadius: '14px', padding: '14px',
                        cursor: 'pointer', transition: 'all 0.25s ease',
                        position: 'relative', overflow: 'hidden'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = cfg.bg;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 6px 20px ${cfg.bg}`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      {/* Shimmer line */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${cfg.color}, transparent)`, opacity: 0.6 }} />

                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: 'var(--text)' }}>{lead.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-3)', marginBottom: '6px' }}>
                        <Phone size={11} /> {lead.phone}
                      </div>

                      {lead.source && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: src.color, fontWeight: 600, background: `${src.color}15`, border: `1px solid ${src.color}30`, borderRadius: '999px', padding: '2px 8px', marginBottom: '8px' }}>
                          {src.icon} {lead.source}
                        </div>
                      )}

                      {lead.notes?.length > 0 && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', color: 'var(--text-2)', borderLeft: `2px solid ${cfg.color}` }}>
                          💬 {lead.notes[lead.notes.length - 1].text}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }} onClick={e => e.stopPropagation()}>
                        <select
                          className="form-control"
                          style={{ padding: '5px 8px', fontSize: '11px', width: '115px', height: '32px', background: 'rgba(255,255,255,0.05)' }}
                          value={lead.status}
                          onChange={e => updateStatus(lead.id, e.target.value)}
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <a href={getWhatsAppLink(lead.phone, lead.name)} target="_blank" rel="noopener noreferrer"
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.25)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.15)'}
                        >
                          <MessageCircle size={15} />
                        </a>
                      </div>
                    </div>
                  );
                })}
                {colLeads.length === 0 && (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: '12px', borderRadius: '12px', border: `1px dashed ${cfg.border}` }}>
                    No leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Lead Detail Modal ── */}
      {selectedLead && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(4,2,14,0.88)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setSelectedLead(null)}>
          <div style={{
            width: '100%', maxWidth: '520px',
            background: 'linear-gradient(135deg, #0d0a21 0%, #0a1220 100%)',
            border: '1px solid rgba(93,169,255,0.2)',
            borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 40px rgba(93,169,255,0.1)',
            animation: 'fadeUp 0.3s ease both'
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(93,169,255,0.15), rgba(124,92,255,0.1))',
              padding: '22px 24px', borderBottom: '1px solid rgba(93,169,255,0.15)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #5DA9FF, #7C5CFF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Edit3 size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Lead Details</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>CRM profile & follow-up log</div>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveLeadModal} style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="grid-2" style={{ gap: '14px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Name</label>
                  <input type="text" className="form-control" required value={editName} onChange={e => setEditName(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Phone Number</label>
                  <input type="tel" className="form-control" required value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '14px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Status</label>
                  <select className="form-control" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Source</label>
                  <select className="form-control" value={editSource} onChange={e => setEditSource(e.target.value)}>
                    {Object.keys(SOURCE_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Follow-up Timeline */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Clock size={15} color="var(--text-3)" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Follow-up Timeline</span>
                  {selectedLead.notes?.length > 0 && (
                    <span style={{ background: 'var(--primary-dim)', color: 'var(--primary-light)', borderRadius: '999px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>{selectedLead.notes.length}</span>
                  )}
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {(!selectedLead.notes || selectedLead.notes.length === 0) ? (
                    <div style={{ color: 'var(--text-3)', fontSize: '12px', fontStyle: 'italic', padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed var(--border)' }}>
                      No follow-up notes yet. Add your first note below.
                    </div>
                  ) : (
                    [...selectedLead.notes].reverse().map((n, i) => (
                      <div key={i} style={{
                        background: 'rgba(93,169,255,0.05)', border: '1px solid rgba(93,169,255,0.15)',
                        padding: '10px 14px', borderRadius: '10px',
                        borderLeft: '3px solid #5DA9FF'
                      }}>
                        <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>{n.text}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '4px' }}>
                          {new Date(n.date).toLocaleDateString()} at {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>New Note</label>
                  <input type="text" className="form-control" placeholder="Log a conversation note…" value={newNoteText} onChange={e => setNewNoteText(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedLead(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={savingLead}>
                  {savingLead ? 'Saving…' : 'Save & Log Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
