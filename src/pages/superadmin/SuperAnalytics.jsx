import React, { useState, useEffect } from 'react';
import { subscribeToAppAnalytics } from '../../services/firestoreService';
import { BarChart2, Activity, Users, FileText, ChevronRight, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const SuperAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAppAnalytics((data) => {
      setAnalyticsData(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Compute stats
  const totalEvents = analyticsData.length;
  const uniqueGyms = new Set(analyticsData.map(d => d.gymId)).size;
  const todayEvents = analyticsData.filter(d => d.date === new Date().toISOString().split('T')[0]).length;

  // Aggregate by event type
  const eventCounts = analyticsData.reduce((acc, curr) => {
    acc[curr.event] = (acc[curr.event] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(eventCounts).map(key => ({
    name: key,
    value: eventCounts[key]
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#7c5cff', '#00d4ff', '#00e676', '#ffd043', '#ff5e7e', '#a3a3a3'];

  // Format event names for display
  const formatEventName = (name) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BarChart2 size={28} color="var(--primary-light)" /> App Analytics
          </h2>
          <p className="text-muted" style={{ marginTop: '4px' }}>
            Track feature usage and engagement across all gyms
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid-3" style={{ gap: '20px', marginBottom: '32px' }}>
            <div className="stat-card" style={{ background: 'rgba(124, 92, 255, 0.05)', border: '1px solid rgba(124, 92, 255, 0.2)' }}>
              <div className="stat-icon" style={{ background: 'rgba(124, 92, 255, 0.1)', color: 'var(--primary-light)' }}><Activity size={20} /></div>
              <div className="stat-value">{totalEvents}</div>
              <div className="stat-label">Total Events Tracked</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
              <div className="stat-icon" style={{ background: 'rgba(0, 212, 255, 0.1)', color: 'var(--accent)' }}><Users size={20} /></div>
              <div className="stat-value">{uniqueGyms}</div>
              <div className="stat-label">Active Gyms Tracking</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(0, 230, 118, 0.05)', border: '1px solid rgba(0, 230, 118, 0.2)' }}>
              <div className="stat-icon" style={{ background: 'rgba(0, 230, 118, 0.1)', color: 'var(--success)' }}><FileText size={20} /></div>
              <div className="stat-value">{todayEvents}</div>
              <div className="stat-label">Events Today</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            {/* Pie Chart */}
            <div style={{ background: 'rgba(10, 8, 30, 0.4)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: 700 }}>Event Distribution</h3>
              {pieData.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ background: 'rgba(10, 8, 30, 0.95)', border: '1px solid var(--border)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value, name) => [value, formatEventName(name)]}
                      />
                      <Legend formatter={(value) => <span style={{ color: 'var(--text-2)', fontSize: '12px' }}>{formatEventName(value)}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-3)' }}>
                  No data available yet
                </div>
              )}
            </div>

            {/* Event Log Table */}
            <div style={{ background: 'rgba(10, 8, 30, 0.4)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Activity Feed</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Showing latest 50 events</div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {analyticsData.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
                    Waiting for events...
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase' }}>Time</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase' }}>Gym</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase' }}>Event</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase' }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.slice(0, 50).map((evt) => (
                        <tr key={evt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-2)' }}>
                            {new Date(evt.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>
                            {evt.gymName}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              background: 'rgba(124, 92, 255, 0.1)', color: 'var(--primary-light)', 
                              border: '1px solid rgba(124, 92, 255, 0.2)', padding: '3px 8px', 
                              borderRadius: '4px', fontSize: '11px', fontWeight: 700 
                            }}>
                              {formatEventName(evt.event)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-3)' }}>
                            {Object.keys(evt.meta || {}).length > 0 
                              ? JSON.stringify(evt.meta).replace(/[{""}]/g, '').replace(/:/g, ': ').replace(/,/g, ', ')
                              : '—'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAnalytics;
