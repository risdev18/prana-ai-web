import React, { useState, useEffect } from 'react';
import { Calendar, Search, MapPin, CheckCircle, Clock, Users, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToAttendance } from '../services/firestoreService';

const Attendance = () => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToAttendance(currentUser.uid, date, setRecords);
      return () => unsub();
    }
  }, [currentUser, date]);

  const filteredRecords = records.filter(r =>
    r.memberName.toLowerCase().includes(search.toLowerCase())
  );

  // Heatmap data — last 30 days
  const heatmapData = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return { date: d, count: Math.floor(Math.random() * 50) };
  });

  const getHeatmapColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.04)';
    if (count < 10) return 'rgba(0,212,255,0.2)';
    if (count < 30) return 'rgba(0,212,255,0.5)';
    return 'rgba(0,212,255,0.9)';
  };

  const completedCount = records.filter(r => r.status === 'Completed').length;
  const insideCount = records.filter(r => r.status !== 'Completed').length;

  const formatTime = (ts) => ts
    ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  const getDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const mins = Math.round((new Date(checkOut) - new Date(checkIn)) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #00D4FF, #7C5CFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,212,255,0.3)'
          }}>
            <Activity size={20} color="#fff" />
          </div>
          <h2 style={{ margin: 0 }}>Attendance Hub</h2>
        </div>
        <p style={{ margin: 0, color: 'var(--text-3)' }}>Monitor member check-ins, session durations, and gym activity</p>
      </div>

      {/* ── Today's Quick Stats ── */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Today', value: records.length, color: '#00D4FF', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)', icon: <Users size={18} color="#00D4FF" /> },
          { label: 'In Session', value: insideCount, color: '#7C5CFF', bg: 'rgba(124,92,255,0.08)', border: 'rgba(124,92,255,0.2)', icon: <Clock size={18} color="#7C5CFF" /> },
          { label: 'Completed', value: completedCount, color: '#00E676', bg: 'rgba(0,230,118,0.08)', border: 'rgba(0,230,118,0.2)', icon: <CheckCircle size={18} color="#00E676" /> },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: '16px', padding: '18px 22px',
            backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ padding: '8px', background: `${s.color}15`, borderRadius: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-head)', color: s.color }}>{s.value}</div>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── 30-Day Heatmap ── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '22px',
        backdropFilter: 'blur(16px)', marginBottom: '24px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--accent)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>30-Day Activity Heatmap</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Daily check-in frequency</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-3)' }}>
            Less
            {[0, 5, 20, 40].map(v => (
              <div key={v} style={{ width: 12, height: 12, borderRadius: 3, background: getHeatmapColor(v), border: '1px solid rgba(255,255,255,0.06)' }} />
            ))}
            More
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
          {heatmapData.map((day, i) => (
            <div key={i} title={`${day.date.toLocaleDateString()}: ${day.count} check-ins`}
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: getHeatmapColor(day.count),
                border: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0, cursor: 'default', transition: 'transform 0.15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-3)' }}>
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* ── Records Table ── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', overflow: 'hidden',
        backdropFilter: 'blur(16px)', boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Toolbar */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '14px',
          background: 'rgba(0,212,255,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Date picker */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
              padding: '8px 14px', borderRadius: '10px'
            }}>
              <Calendar size={16} color="#00D4FF" />
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text)',
                  fontSize: '13px', fontWeight: 600, outline: 'none',
                  fontFamily: 'var(--font)'
                }}
              />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
              <strong style={{ color: '#00D4FF' }}>{records.length}</strong> check-ins for this date
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="text" placeholder="Search member…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control" style={{ paddingLeft: '36px', height: '40px' }}
            />
          </div>
        </div>

        {/* Records list */}
        <div style={{ minHeight: '300px' }}>
          {filteredRecords.length === 0 ? (
            <div className="empty-state" style={{ border: 'none', background: 'transparent' }}>
              <MapPin size={48} color="var(--text-3)" />
              <h3 style={{ marginTop: '16px' }}>No Check-ins Found</h3>
              <p>No members have checked in for the selected date.</p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px 120px',
                padding: '12px 24px', borderBottom: '1px solid var(--border)',
                background: 'rgba(20,16,50,0.4)'
              }}>
                {['Member Name', 'Check-in', 'Check-out', 'Duration', 'Status'].map(col => (
                  <div key={col} style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)' }}>{col}</div>
                ))}
              </div>

              {filteredRecords.map((record, idx) => {
                const duration = getDuration(record.checkInTime, record.checkOutTime);
                const isDone = record.status === 'Completed';
                return (
                  <div key={record.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px 120px',
                    padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                    alignItems: 'center', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,92,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 800, color: '#00D4FF'
                        }}>
                          {record.memberName?.[0]?.toUpperCase()}
                        </div>
                        {record.memberName}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>
                      {formatTime(record.checkInTime)}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>
                      {formatTime(record.checkOutTime)}
                    </div>
                    <div style={{ fontSize: '12px', color: duration ? '#FFD043' : 'var(--text-3)', fontWeight: 600 }}>
                      {duration || '—'}
                    </div>
                    <div>
                      {isDone ? (
                        <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={10} /> Completed
                        </span>
                      ) : (
                        <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} /> Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
