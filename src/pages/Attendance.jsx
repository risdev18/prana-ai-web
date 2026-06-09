import React, { useState, useEffect } from 'react';
import { Calendar, Search, MapPin, CheckCircle, Clock } from 'lucide-react';
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

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-head)', lineHeight: 1.2 }}>Attendance Hub</h1>
          <p style={{ color: 'var(--text-2)' }}>Monitor daily member check-ins securely via GPS.</p>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <Calendar size={18} color="var(--primary-light)" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            
            <div style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
              <strong style={{ color: '#fff' }}>{records.length}</strong> Check-ins today
            </div>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search member name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 10px 10px 36px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff', fontSize: '0.85rem'
              }}
            />
          </div>

        </div>

        {/* List */}
        <div style={{ minHeight: '400px' }}>
          {filteredRecords.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <MapPin size={48} color="rgba(255,255,255,0.1)" />
              <div>No attendance records found for this date.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>Member</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>Check-In Time</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>Check-Out Time</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#fff' }}>
                      {record.memberName}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                      {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                      {record.checkOutTime 
                        ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-'
                      }
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {record.status === 'Completed' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
                          <CheckCircle size={16} /> Completed
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontSize: '0.85rem', fontWeight: 600 }}>
                          <Clock size={16} /> Inside Gym
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default Attendance;
