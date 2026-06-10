import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMembers } from '../services/firestoreService';

const Workouts = () => {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [assigningTo, setAssigningTo] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToMembers(currentUser.uid, setMembers);
      return () => unsub();
    }
  }, [currentUser]);

  const filteredMembers = members.filter(m => m.memberName.toLowerCase().includes(search.toLowerCase()));

  const handleAssign = (e) => {
    e.preventDefault();
    alert('Plan assigned successfully!');
    setAssigningTo(null);
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Workout & Diet Assignment</h2>
          <p className="text-muted">Simple assignment of predefined plans to active members.</p>
        </div>
      </div>

      {assigningTo ? (
        <div className="card animate-fade-up">
          <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>Assign Plan to {assigningTo.memberName}</h3>
            <button className="btn btn-ghost" onClick={() => setAssigningTo(null)}>Cancel</button>
          </div>
          <form onSubmit={handleAssign} className="grid-2 gap-4">
            <div className="form-group mb-0">
              <label>Workout Template</label>
              <select className="form-control" required>
                <option value="">Select a template...</option>
                <option value="Beginner Full Body">Beginner Full Body</option>
                <option value="Intermediate Split">Intermediate Split</option>
                <option value="Advanced Push/Pull">Advanced Push/Pull</option>
                <option value="Weight Loss Circuit">Weight Loss Circuit</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label>Diet Template</label>
              <select className="form-control" required>
                <option value="">Select a template...</option>
                <option value="Standard Maintenance">Standard Maintenance</option>
                <option value="Caloric Deficit">Caloric Deficit</option>
                <option value="High Protein Muscle Gain">High Protein Muscle Gain</option>
              </select>
            </div>
            <div className="form-group mb-0" style={{ gridColumn: '1 / -1' }}>
              <label>Trainer Notes (Optional)</label>
              <textarea className="form-control" rows={3} placeholder="Add specific instructions..."></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Assign & Notify Member</button>
          </form>
        </div>
      ) : (
        <>
          <div className="mb-6" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input 
              type="text" className="form-control" placeholder="Search members to assign plans..."
              style={{ paddingLeft: '44px' }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="card" style={{ padding: 0 }}>
            {filteredMembers.length === 0 ? (
              <div className="empty-state border-none">
                <ClipboardList size={48} />
                <h3 className="mt-4">No members found</h3>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredMembers.map(m => (
                  <div key={m.id} className="flex justify-between items-center" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.memberName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>ID: {m.shortId} • {m.goal || 'No Goal Set'}</div>
                    </div>
                    <button className="btn btn-outline" onClick={() => setAssigningTo(m)}>
                      <Plus size={16} /> Assign Plan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Workouts;
