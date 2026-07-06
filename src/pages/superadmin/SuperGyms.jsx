import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Shield, ShieldAlert, CheckCircle, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperGyms = () => {
  const [gyms, setGyms] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'Gyms'));
    const unsub = onSnapshot(q, (snapshot) => {
      setGyms(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (gymId, newStatus) => {
    try {
      await updateDoc(doc(db, 'Gyms', gymId), {
        status: newStatus
      });
      toast.success(`Gym status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteGym = async (gymId) => {
    if (!window.confirm("Are you sure you want to delete this gym and its data? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'Gyms', gymId));
      toast.success("Gym deleted successfully");
    } catch (err) {
      toast.error("Failed to delete gym: " + err.message);
    }
  };

  const filtered = gyms.filter(g => 
    g.gymName?.toLowerCase().includes(search.toLowerCase()) || 
    g.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
    g.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Manage Gyms</h2>
          <p style={{ margin: 0, color: 'var(--text-3)' }}>Approve or revoke gym access</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input 
            type="text" 
            className="input" 
            placeholder="Search gyms..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-3)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Gym Name</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-3)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Owner</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-3)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-3)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-3)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(gym => (
                <tr key={gym.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {gym.role === 'superadmin' && <Shield size={14} color="var(--primary)" />}
                      {gym.gymName}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-2)' }}>{gym.ownerName}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-2)' }}>{gym.email}</td>
                  <td style={{ padding: '16px 24px' }}>
                    {gym.status === 'active' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '13px', background: 'rgba(0, 230, 118, 0.1)', padding: '4px 10px', borderRadius: '100px' }}>
                        <CheckCircle size={14} /> Active
                      </span>
                    )}
                    {gym.status === 'trial' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gold)', fontSize: '13px', background: 'rgba(255, 176, 32, 0.1)', padding: '4px 10px', borderRadius: '100px' }}>
                        <CheckCircle size={14} /> Trial
                      </span>
                    )}
                    {gym.status === 'blocked' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--error)', fontSize: '13px', background: 'rgba(255, 94, 126, 0.1)', padding: '4px 10px', borderRadius: '100px' }}>
                        <ShieldAlert size={14} /> Blocked
                      </span>
                    )}
                    {(!['active', 'trial', 'blocked'].includes(gym.status)) && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--warning)', fontSize: '13px', background: 'rgba(255, 171, 0, 0.1)', padding: '4px 10px', borderRadius: '100px' }}>
                        <ShieldAlert size={14} /> {gym.status || 'Pending'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {gym.role !== 'superadmin' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <select 
                          className="input" 
                          value={gym.status || 'pending'} 
                          onChange={(e) => handleUpdateStatus(gym.id, e.target.value)}
                          style={{ padding: '6px 12px', fontSize: '13px', minWidth: '110px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="trial">Trial</option>
                          <option value="active">Active</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        <button 
                          onClick={() => handleDeleteGym(gym.id)} 
                          className="btn btn-outline" 
                          style={{ padding: '6px', color: 'var(--error)' }}
                          title="Delete Gym"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                    No gyms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperGyms;
