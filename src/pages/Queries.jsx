import React, { useEffect, useState } from 'react';
import {
  MessageSquare, CheckCircle, Clock, AlertCircle, ChevronDown,
  ChevronUp, Send, Trash2, MessageCircle, Filter, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToQueries, updateQuery, deleteQuery } from '../services/firestoreService';

const STATUS_COLORS = {
  'Open':        { bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)',    text: '#ef4444' },
  'In Progress': { bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.3)',   text: '#f59e0b' },
  'Resolved':    { bg: 'rgba(6,214,160,0.12)',    border: 'rgba(6,214,160,0.3)',    text: '#06d6a0' },
};

const TYPE_ICONS = {
  'Complaint':   '⚠️',
  'Query':       '❓',
  'Feedback':    '💬',
  'Suggestion':  '💡',
};

const Queries = () => {
  const { currentUser, gymData } = useAuth();
  const [queries, setQueries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToQueries(currentUser.uid, setQueries);
    return () => unsub();
  }, [currentUser]);

  const filtered = queries.filter(q => {
    const matchesFilter = filter === 'All' || q.status === filter;
    const matchesSearch = !search.trim() ||
      q.memberName?.toLowerCase().includes(search.toLowerCase()) ||
      q.subject?.toLowerCase().includes(search.toLowerCase()) ||
      q.message?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (q, newStatus) => {
    setSavingId(q.id);
    try {
      await updateQuery(currentUser.uid, q.id, { status: newStatus });
    } finally {
      setSavingId(null);
    }
  };

  const handleAddNote = async (q) => {
    const note = noteInputs[q.id]?.trim();
    if (!note) return;
    setSavingId(q.id);
    try {
      const updatedNotes = [
        ...(q.followUpNotes || []),
        { text: note, by: gymData?.ownerName || 'Owner', at: new Date().toISOString() }
      ];
      await updateQuery(currentUser.uid, q.id, { followUpNotes: updatedNotes });
      setNoteInputs(prev => ({ ...prev, [q.id]: '' }));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (q) => {
    if (!window.confirm(`Delete query from ${q.memberName}? This is permanent.`)) return;
    await deleteQuery(currentUser.uid, q.id);
  };

  const getWhatsAppReply = (q) => {
    const phone = q.memberPhone?.replace(/\D/g, '');
    if (!phone) return '#';
    const formatted = phone.length === 10 ? `91${phone}` : phone;
    const gym = gymData?.gymName || 'our gym';
    const text = `Hi ${q.memberName}, this is a follow-up from ${gym} regarding your ${q.type?.toLowerCase() || 'query'}: "${q.subject}". We're on it! 🙏`;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
  };

  const openCount  = queries.filter(q => q.status === 'Open').length;
  const inProgCount = queries.filter(q => q.status === 'In Progress').length;
  const resolvedCount = queries.filter(q => q.status === 'Resolved').length;

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-head)' }}>Queries &amp; Complaints</h2>
          <p className="text-muted">Manage member queries, follow-ups, and resolutions.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 mb-6">
        {[
          { label: 'Open', value: openCount, color: '#ef4444', icon: <AlertCircle size={22} /> },
          { label: 'In Progress', value: inProgCount, color: '#f59e0b', icon: <Clock size={22} /> },
          { label: 'Resolved', value: resolvedCount, color: '#06d6a0', icon: <CheckCircle size={22} /> },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600, marginTop: '3px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text" className="form-control"
            placeholder="Search by name, subject..."
            style={{ paddingLeft: '40px' }}
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Open', 'In Progress', 'Resolved'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '7px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                border: '1px solid',
                background: filter === s ? 'var(--primary)' : 'transparent',
                borderColor: filter === s ? 'var(--primary)' : 'var(--border)',
                color: filter === s ? '#fff' : 'var(--text-2)',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Queries List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={48} />
          <h3 style={{ marginTop: '16px' }}>No queries found</h3>
          <p>{queries.length === 0 ? 'No member queries yet. They will appear here once members submit them.' : 'No queries match your current filter.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(q => {
            const isExpanded = expandedId === q.id;
            const sc = STATUS_COLORS[q.status] || STATUS_COLORS['Open'];
            const hasPhone = !!q.memberPhone;

            return (
              <div
                key={q.id}
                className="card"
                style={{
                  padding: 0, overflow: 'hidden',
                  border: `1px solid ${isExpanded ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                  transition: 'border-color 0.2s ease'
                }}
              >
                {/* Card Header — always visible */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 20px', cursor: 'pointer'
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  {/* Type Icon */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', flexShrink: 0
                  }}>
                    {TYPE_ICONS[q.type] || '❓'}
                  </div>

                  {/* Main Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{q.memberName}</span>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                        background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                        padding: '2px 9px', borderRadius: '999px'
                      }}>
                        {q.status}
                      </span>
                      {q.type && (
                        <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{q.type}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.subject}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '3px' }}>
                      {new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <div style={{ color: 'var(--text-3)', flexShrink: 0 }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Expanded Body */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '20px' }}>
                    {/* Message */}
                    <div style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                      borderRadius: '12px', padding: '16px', marginBottom: '18px',
                      fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.6
                    }}>
                      {q.message || 'No message provided.'}
                    </div>

                    {/* Follow-up Notes Timeline */}
                    {q.followUpNotes?.length > 0 && (
                      <div style={{ marginBottom: '18px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: '10px' }}>
                          Follow-up Log
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {q.followUpNotes.map((note, i) => (
                            <div key={i} style={{
                              display: 'flex', gap: '12px', alignItems: 'flex-start',
                              padding: '10px 14px', borderRadius: '10px',
                              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)'
                            }}>
                              <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: 'var(--primary)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: 700, flexShrink: 0
                              }}>
                                {note.by?.[0] || 'O'}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', color: 'var(--text)' }}>{note.text}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '3px' }}>
                                  {note.by} · {new Date(note.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Note */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add a follow-up note..."
                        value={noteInputs[q.id] || ''}
                        onChange={e => setNoteInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNote(q); } }}
                        style={{ flex: 1, fontSize: '13px' }}
                      />
                      <button
                        className="btn btn-primary"
                        style={{ padding: '10px 16px', flexShrink: 0 }}
                        onClick={() => handleAddNote(q)}
                        disabled={savingId === q.id}
                      >
                        <Send size={16} />
                      </button>
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Status Changer */}
                      <select
                        className="form-control"
                        style={{ width: 'auto', fontSize: '13px', padding: '8px 12px' }}
                        value={q.status}
                        onChange={e => handleStatusChange(q, e.target.value)}
                        disabled={savingId === q.id}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>

                      {/* WhatsApp Reply */}
                      <a
                        href={getWhatsAppReply(q)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{ background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: '13px', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={e => { if (!hasPhone) { e.preventDefault(); alert('No phone number on this query.'); } }}
                      >
                        <MessageCircle size={15} /> WhatsApp Reply
                      </a>

                      {/* Delete */}
                      <button
                        className="btn"
                        style={{ marginLeft: 'auto', background: 'var(--error-bg)', color: 'var(--error)', fontSize: '13px', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => handleDelete(q)}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Queries;
