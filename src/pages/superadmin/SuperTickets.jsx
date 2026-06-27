import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ShieldAlert, CheckCircle, Clock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['Open', 'In Progress', 'Resolved'];

const SuperTickets = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'GlobalTickets'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'GlobalTickets', id), {
        status: newStatus
      });
      toast.success(`Ticket marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update ticket');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await deleteDoc(doc(db, 'GlobalTickets', id));
      toast.success('Ticket deleted');
    } catch (err) {
      toast.error('Failed to delete ticket');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Resolved') return <CheckCircle size={16} color="var(--success)" />;
    if (status === 'In Progress') return <Clock size={16} color="var(--warning)" />;
    return <ShieldAlert size={16} color="var(--error)" />;
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ margin: 0 }}>Global Tickets</h2>
        <p style={{ margin: 0, color: 'var(--text-3)' }}>Manage complaints and inquiries from gym owners</p>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', overflow: 'hidden'
      }}>
        {tickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
            No tickets to display.
          </div>
        ) : (
          <div>
            {tickets.map(t => (
              <div key={t.id} style={{
                padding: '20px 24px', borderBottom: '1px solid var(--border)',
                display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between',
                background: t.status === 'Resolved' ? 'rgba(255,255,255,0.01)' : 'transparent'
              }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    {getStatusIcon(t.status)}
                    <h4 style={{ margin: 0, fontSize: '16px', color: t.status === 'Resolved' ? 'var(--text-3)' : '#fff' }}>{t.subject}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, background: 'rgba(124, 92, 255, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {t.gymName}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                    {t.message}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                    Created: {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <select 
                    className="input" 
                    value={t.status} 
                    onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                    style={{ width: '130px', padding: '8px', fontSize: '13px', background: 'rgba(255,255,255,0.03)' }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => handleDelete(t.id)} className="btn btn-outline" style={{ padding: '8px', color: 'var(--error)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperTickets;
