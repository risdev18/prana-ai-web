import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToStaff, addStaff } from '../services/firestoreService';
import { Dumbbell, Plus, User, Phone, CheckCircle } from 'lucide-react';

const Trainers = () => {
  const { currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', role: 'Trainer', specialty: '' });

  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToStaff(currentUser.uid, setStaff);
      return () => unsub();
    }
  }, [currentUser]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.phone) return;
    await addStaff(currentUser.uid, newStaff);
    setIsAdding(false);
    setNewStaff({ name: '', phone: '', role: 'Trainer', specialty: '' });
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Staff & Trainers</h2>
          <p className="text-muted">Manage your gym's team and specialties.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> <span className="hide-mobile">Add Staff</span>
        </button>
      </div>

      {isAdding && (
        <div className="card mb-6 animate-fade-up">
          <h3>Add New Staff</h3>
          <form onSubmit={handleAddStaff} className="grid-2 gap-3 mt-4">
            <div className="form-group mb-0">
              <label>Name</label>
              <input type="text" className="form-control" required value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
            </div>
            <div className="form-group mb-0">
              <label>Phone Number</label>
              <input type="tel" className="form-control" required value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} />
            </div>
            <div className="form-group mb-0">
              <label>Role</label>
              <select className="form-control" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                <option value="Trainer">Trainer</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label>Specialty (Optional)</label>
              <input type="text" className="form-control" placeholder="e.g. Weight Loss, CrossFit" value={newStaff.specialty} onChange={e => setNewStaff({...newStaff, specialty: e.target.value})} />
            </div>
            <div className="grid-2" style={{ gridColumn: '1 / -1', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Staff</button>
            </div>
          </form>
        </div>
      )}

      {staff.length === 0 && !isAdding ? (
        <div className="empty-state border-none">
          <Dumbbell size={48} />
          <h3 className="mt-4">No staff added yet</h3>
          <p>Add your first trainer or receptionist to start delegating tasks.</p>
          <button className="btn btn-outline mt-4" onClick={() => setIsAdding(true)}>
            <Plus size={18} /> Add Staff
          </button>
        </div>
      ) : (
        <div className="grid-3 gap-4">
          {staff.map(s => (
            <div key={s.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600 }}>
                  {s.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone size={14} /> {s.phone}
              </div>
              {s.specialty && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <CheckCircle size={14} color="var(--success)" /> {s.specialty}
                </div>
              )}
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost w-full" style={{ fontSize: '13px' }}>Assign Members</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trainers;
