import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, CheckCircle, QrCode } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { updateMember } from '../services/firestoreService';
import QRCode from 'react-qr-code';

const AddMember = () => {
  const navigate = useNavigate();
  const { gymData, currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    memberName: '',
    phone: '',
    durationMonths: 1,
    paymentStatus: 'Paid'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMember, setSuccessMember] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.memberName.trim()) return setError('Name is required');
    if (!formData.phone.trim()) return setError('Phone is required');

    setLoading(true);
    setError('');

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + parseInt(formData.durationMonths));

      const gymName = gymData?.gymName || 'GYM';
      const prefix = gymName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,4);
      const shortId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newMember = {
        memberId: uuidv4(),
        shortId,
        memberName: formData.memberName.trim(),
        phone: formData.phone.trim(),
        membershipStartDate: startDate.toISOString().split('T')[0],
        membershipEndDate: endDate.toISOString().split('T')[0],
        paymentStatus: formData.paymentStatus,
        createdAt: new Date().toISOString(),
        goal: 'Maintain Fitness',
        activityLevel: 'Moderately Active'
      };

      // Assuming updateMember acts as an upsert (or addMember function exists, we use updateMember as per current patterns)
      await updateMember(currentUser.uid, newMember);
      
      setSuccessMember(newMember);
    } catch (err) {
      setError('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successMember) {
    const qrValue = `${window.location.origin}/member-portal`;
    return (
      <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="card text-center animate-fade-up" style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={32} />
          </div>
          <h2 style={{ marginBottom: '8px' }}>Member Added!</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>{successMember.memberName} is now active.</p>
          
          <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}>
            <QRCode value={qrValue} size={150} level="M" />
          </div>
          
          <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--primary)', marginBottom: '24px' }}>
            ID: {successMember.shortId}
          </div>

          <div className="flex gap-3">
            <button className="btn btn-outline flex-1" onClick={() => setSuccessMember(null)}>Add Another</button>
            <button className="btn btn-primary flex-1" onClick={() => navigate('/members')}>View Members</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        <div className="flex items-center gap-3 mb-6">
          <button className="btn btn-ghost" style={{ padding: '8px', width: 'auto' }} onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Quick Add Member</h2>
            <p className="text-muted" style={{ fontSize: '13px' }}>Takes less than 10 seconds</p>
          </div>
        </div>

        {error && (
          <div className="badge badge-red mb-4 w-full justify-center p-3 text-sm">
            {error}
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type="text" name="memberName" className="form-control" required autoFocus
                  placeholder="e.g. Rahul Sharma" style={{ paddingLeft: '38px' }}
                  value={formData.memberName} onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type="tel" name="phone" className="form-control" required
                  placeholder="10-digit number" style={{ paddingLeft: '38px' }}
                  value={formData.phone} onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid-2 gap-3 mb-4">
              <div className="form-group mb-0">
                <label>Plan Duration</label>
                <select name="durationMonths" className="form-control" value={formData.durationMonths} onChange={handleChange}>
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>1 Year</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label>Payment Status</label>
                <select name="paymentStatus" className="form-control" value={formData.paymentStatus} onChange={handleChange}>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2" disabled={loading} style={{ padding: '14px', fontSize: '15px' }}>
              {loading ? 'Saving...' : <><QrCode size={18} /> Save & Generate QR</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMember;
