import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertCircle, Clock, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Open', 'In Progress', 'Resolved'];

const Tickets = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, 'Gyms', currentUser.uid, 'Tickets'),
        orderBy('createdAt', 'desc')
      );
      const unsub = onSnapshot(q, (snapshot) => {
        setTickets(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
      });
      return () => unsub();
    }
  }, [currentUser]);

  const handleAddTicket = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    
    try {
      await addDoc(collection(db, 'Gyms', currentUser.uid, 'Tickets'), {
        title,
        description,
        priority,
        status: 'Open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Ticket created');
      setShowAdd(false);
      setTitle(''); setDescription(''); setPriority('Medium');
    } catch (err) {
      toast.error('Failed to create ticket');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'Gyms', currentUser.uid, 'Tickets', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`Ticket marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update ticket');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await deleteDoc(doc(db, 'Gyms', currentUser.uid, 'Tickets', id));
      toast.success('Ticket deleted');
    } catch (err) {
      toast.error('Failed to delete ticket');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Resolved') return <CheckCircle size={16} color="var(--success)" />;
    if (status === 'In Progress') return <Clock size={16} color="var(--warning)" />;
    return <AlertCircle size={16} color="var(--error)" />;
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF9B8B, #FF5E7E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255,94,126,0.3)'
            }}>
              <ShieldAlert size={20} color="#fff" />
            </div>
            <h2 style={{ margin: 0 }}>Support Tickets</h2>
          </div>
          <p style={{ margin: 0, color: 'var(--text-3)' }}>Manage facility issues and maintenance tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ gap: '8px' }}>
          <Plus size={18} /> New Ticket
        </button>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', overflow: 'hidden'
      }}>
        {tickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
            No tickets to display. Facility is running perfectly!
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
                    <h4 style={{ margin: 0, fontSize: '16px', color: t.status === 'Resolved' ? 'var(--text-3)' : '#fff' }}>{t.title}</h4>
                    {t.priority === 'High' && <span className="badge badge-red" style={{ fontSize: '10px' }}>High Priority</span>}
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                    {t.description}
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

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
              background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '400px'
          }}>
            <h3 style={{ marginTop: 0 }}>Create Ticket</h3>
            <form onSubmit={handleAddTicket}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Issue Title</label>
                <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Broken AC in men's locker room" required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Description</label>
                <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} rows="3" required />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Priority</label>
                <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
                  {PRIORITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
