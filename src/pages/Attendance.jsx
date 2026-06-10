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

  // Generate fake heatmap data for the last 30 days
  const heatmapData = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d,
      count: Math.floor(Math.random() * 50)
    };
  });

  const getHeatmapColor = (count) => {
    if (count === 0) return 'var(--bg)';
    if (count < 10) return 'rgba(16, 185, 129, 0.3)'; // success with low opacity
    if (count < 30) return 'rgba(16, 185, 129, 0.6)';
    return 'rgba(16, 185, 129, 1)'; // var(--success)
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Attendance Hub</h2>
          <p className="text-muted">Monitor check-ins and member consistency.</p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="card mb-6">
        <h3 className="card-title">30-Day Activity Heatmap</h3>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px' }}>
          {heatmapData.map((day, i) => (
            <div 
              key={i}
              title={`${day.date.toLocaleDateString()}: ${day.count} check-ins`}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                background: getHeatmapColor(day.count),
                border: '1px solid var(--border)',
                flexShrink: 0
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-muted text-sm">30 days ago</div>
          <div className="text-muted text-sm flex gap-2 items-center">
            Less 
            <div style={{ display: 'flex', gap: '2px' }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: getHeatmapColor(0) }} />
              <div style={{ width: 12, height: 12, borderRadius: 2, background: getHeatmapColor(5) }} />
              <div style={{ width: 12, height: 12, borderRadius: 2, background: getHeatmapColor(20) }} />
              <div style={{ width: 12, height: 12, borderRadius: 2, background: getHeatmapColor(40) }} />
            </div>
            More
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <Calendar size={18} color="var(--primary)" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
              />
            </div>
            
            <div style={{ color: 'var(--text-2)', fontSize: '14px' }}>
              <strong style={{ color: 'var(--text)' }}>{records.length}</strong> Check-ins today
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search member name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px' }}
            />
          </div>

        </div>

        {/* List */}
        <div style={{ minHeight: '400px' }}>
          {filteredRecords.length === 0 ? (
            <div className="empty-state" style={{ border: 'none' }}>
              <MapPin size={48} />
              <h3>No check-ins found</h3>
              <p>No members have checked in on this date yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredRecords.map(record => (
                <div key={record.id} style={{ 
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '16px 20px', borderBottom: '1px solid var(--border)', gap: '16px' 
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '15px', minWidth: '150px' }}>
                    {record.memberName}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase' }}>In</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-2)' }}>
                        {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase' }}>Out</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-2)' }}>
                        {record.checkOutTime 
                          ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'
                        }
                      </div>
                    </div>
                  </div>

                  <div style={{ minWidth: '100px', textAlign: 'right' }}>
                    {record.status === 'Completed' ? (
                      <span className="badge badge-green flex items-center justify-center gap-1" style={{ display: 'inline-flex' }}>
                        <CheckCircle size={12} /> Completed
                      </span>
                    ) : (
                      <span className="badge badge-purple flex items-center justify-center gap-1" style={{ display: 'inline-flex' }}>
                        <Clock size={12} /> Inside Gym
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Attendance;
