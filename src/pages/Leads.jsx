import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToEnquiries, addEnquiry, updateEnquiry } from '../services/firestoreService';
import { MessageCircle, Phone, User, Plus, Search } from 'lucide-react';

const Leads = () => {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    status: 'New Inquiry'
  });

  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToEnquiries(currentUser.uid, setLeads);
      return () => unsub();
    }
  }, [currentUser]);

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return;
    
    await addEnquiry(currentUser.uid, newLead);
    setIsAdding(false);
    setNewLead({ name: '', phone: '', status: 'New Inquiry' });
  };

  const updateStatus = async (id, status) => {
    await updateEnquiry(currentUser.uid, id, { status });
  };

  const getWhatsAppLink = (phone, name) => {
    const cleanPhone = phone?.replace(/\D/g, '');
    if (!cleanPhone) return '#';
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(`Hi ${name}, thank you for your inquiry at our gym! Let me know if you have any questions or want to schedule a visit.`);
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.phone.includes(search)
  );

  const statuses = ['New Inquiry', 'Trial', 'Follow-up', 'Converted'];

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Lead Management</h2>
          <p className="text-muted">Track inquiries, trials, and follow-ups.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> <span className="hide-mobile">Add Lead</span>
        </button>
      </div>

      {isAdding && (
        <div className="card mb-6 animate-fade-up">
          <h3>Add New Inquiry</h3>
          <form onSubmit={handleAddLead} className="grid-3 gap-3 items-end mt-4">
            <div className="form-group mb-0">
              <label>Name</label>
              <input type="text" className="form-control" required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} />
            </div>
            <div className="form-group mb-0">
              <label>Phone Number</label>
              <input type="tel" className="form-control" required value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-outline flex-1" onClick={() => setIsAdding(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary flex-1">Save Lead</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6" style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input 
          type="text" className="form-control" placeholder="Search leads by name or phone..."
          style={{ paddingLeft: '44px' }}
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid-4 gap-4" style={{ overflowX: 'auto', paddingBottom: '16px' }}>
        {statuses.map(status => {
          const colLeads = filteredLeads.filter(l => l.status === status);
          return (
            <div key={status} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '16px', minWidth: '280px', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-2)' }}>{status}</div>
                <div className="badge badge-gray">{colLeads.length}</div>
              </div>
              
              <div className="flex flex-col gap-3">
                {colLeads.map(lead => (
                  <div key={lead.id} style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{lead.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>
                      <Phone size={12} /> {lead.phone}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <select 
                        className="form-control" 
                        style={{ padding: '6px 10px', fontSize: '12px', width: '130px', background: 'rgba(255,255,255,0.05)' }}
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      
                      <a 
                        href={getWhatsAppLink(lead.phone, lead.name)}
                        target="_blank" rel="noopener noreferrer"
                        className="btn" style={{ padding: '6px 10px', background: '#25D366', color: '#fff' }}
                      >
                        <MessageCircle size={16} />
                      </a>
                    </div>
                  </div>
                ))}
                {colLeads.length === 0 && (
                  <div className="text-center text-muted text-sm py-4">No leads</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leads;
