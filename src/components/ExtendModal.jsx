import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { updateMember } from '../services/firestoreService';
import { addMonthsSafe, getNextDay } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ExtendModal = ({ isOpen, onClose, member, onExtendSuccess }) => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    startDate: '',
    durationMonths: 1,
    endDate: '',
    membershipFee: '',
    amountPaid: '',
    paymentStatus: 'Pending'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isEndDateManuallyEdited, setIsEndDateManuallyEdited] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      const todayStr = new Date().toISOString().split('T')[0];
      let initialStartDate = todayStr;
      
      if (member.membershipEndDate) {
        const endD = new Date(member.membershipEndDate);
        const today = new Date(todayStr);
        if (endD >= today) {
          initialStartDate = getNextDay(member.membershipEndDate);
        }
      }
      
      setFormData({
        startDate: initialStartDate,
        durationMonths: 1,
        endDate: addMonthsSafe(initialStartDate, 1),
        membershipFee: member.membershipFee || '',
        amountPaid: member.membershipFee || '',
        paymentStatus: 'Paid'
      });
      setIsEndDateManuallyEdited(false);
    }
  }, [isOpen, member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      
      if (name === 'startDate' && !isEndDateManuallyEdited) {
        next.endDate = addMonthsSafe(value, next.durationMonths);
      }
      
      if (name === 'durationMonths') {
        setIsEndDateManuallyEdited(false);
        next.endDate = addMonthsSafe(next.startDate, value);
      }
      
      if (name === 'endDate') {
        setIsEndDateManuallyEdited(true);
      }
      
      if (name === 'membershipFee' || name === 'amountPaid') {
        const fee = name === 'membershipFee' ? parseFloat(value) || 0 : parseFloat(next.membershipFee) || 0;
        const paid = name === 'amountPaid' ? parseFloat(value) || 0 : parseFloat(next.amountPaid) || 0;
        next.paymentStatus = paid >= fee ? 'Paid' : 'Pending';
      }
      
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    
    const fee = parseFloat(formData.membershipFee);
    const paid = parseFloat(formData.amountPaid);
    
    if (isNaN(fee) || fee < 0) return toast.error('Fee must be greater than or equal to 0');
    if (isNaN(paid) || paid < 0) return toast.error('Amount paid must be greater than or equal to 0');
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      return toast.error('End date cannot be before start date');
    }
    
    setIsSaving(true);
    
    try {
      const historyItem = {
        previousStartDate: member.membershipStartDate || '',
        previousEndDate: member.membershipEndDate || '',
        previousFee: member.membershipFee || 0,
        previousAmountPaid: member.amountPaid || 0,
        extendedAt: new Date().toISOString()
      };
      
      const updatedHistory = [...(member.membershipHistory || []), historyItem];
      
      const updatedMember = {
        ...member,
        membershipStartDate: formData.startDate,
        membershipEndDate: formData.endDate,
        membershipDuration: parseInt(formData.durationMonths, 10),
        membershipFee: fee,
        amountPaid: paid,
        paymentStatus: formData.paymentStatus,
        membershipHistory: updatedHistory,
      };
      
      await updateMember(currentUser.uid, updatedMember);
      toast.success('Membership extended successfully!');
      
      onExtendSuccess(updatedMember);
      onClose();
    } catch (error) {
      console.error('Error extending membership:', error);
      toast.error('Failed to extend membership');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card animate-fade-up" style={{ 
        width: '100%', maxWidth: '500px', background: 'var(--bg-card)', 
        position: 'relative', padding: '0', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--primary-light)" />
            Extend Membership
          </h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          
          <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
             <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{member?.memberName}</div>
             <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Current Expiry: {member?.membershipEndDate ? new Date(member.membershipEndDate).toLocaleDateString('en-GB') : 'N/A'}</div>
          </div>

          <div className="grid-2 gap-3" style={{ marginBottom: '14px' }}>
            <div className="form-group mb-0">
              <label>Start Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type="date" name="startDate" className="form-control" required
                  style={{ paddingLeft: '34px' }}
                  value={formData.startDate} onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group mb-0">
              <label>Duration (Months)</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <select 
                  name="durationMonths" className="form-control" 
                  style={{ paddingLeft: '34px' }}
                  value={formData.durationMonths} onChange={handleChange}
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>End Date</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input
                type="date" name="endDate" className="form-control" required
                style={{ paddingLeft: '34px' }}
                value={formData.endDate} onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2 gap-3" style={{ marginBottom: '14px' }}>
            <div className="form-group mb-0">
              <label>Membership Fee (₹)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type="number" name="membershipFee" className="form-control" required min="0"
                  style={{ paddingLeft: '34px' }}
                  value={formData.membershipFee} onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group mb-0">
              <label>Amount Paid (₹)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type="number" name="amountPaid" className="form-control" required min="0"
                  style={{ paddingLeft: '34px' }}
                  value={formData.amountPaid} onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Payment Status</label>
            <select name="paymentStatus" className="form-control" value={formData.paymentStatus} onChange={handleChange}>
              <option value="Paid">Fully Paid</option>
              <option value="Pending">Pending / Balance Due</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn btn-outline flex-1" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> {isSaving ? 'Saving...' : 'Extend & Generate Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExtendModal;
