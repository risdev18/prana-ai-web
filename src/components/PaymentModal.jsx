import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Wallet, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateMember, addTransaction, logAudit } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const PaymentModal = ({ isOpen, onClose, member, onPaymentSuccess }) => {
  const { currentUser, gymData } = useAuth();
  
  // Safe parsing of member data
  const membershipFee = member?.membershipFee ?? 0;
  const amountPaid = member?.amountPaid ?? 0;
  const balance = membershipFee - amountPaid;
  
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }
    
    if (numAmount > balance) {
      toast.error(`Payment (₹${numAmount}) exceeds remaining balance (₹${balance}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new payment record
      const paymentRecord = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        amount: numAmount,
        method,
        notes,
        date: new Date().toISOString(),
      };

      // Prepare updated member object
      const updatedPayments = [...(member.payments || []), paymentRecord];
      const newAmountPaid = amountPaid + numAmount;
      
      const updatedMember = {
        ...member,
        amountPaid: newAmountPaid,
        payments: updatedPayments,
        paymentStatus: newAmountPaid >= membershipFee ? 'Paid' : 'Partial',
      };

      await updateMember(currentUser.uid, updatedMember);
      
      // Also log as a general transaction for Reports
      await addTransaction(currentUser.uid, {
        amount: numAmount,
        type: 'income',
        method,
        notes: `Payment from ${member.memberName} (${notes})`,
        date: paymentRecord.date
      });
      
      // Log Audit
      await logAudit(currentUser.uid, currentUser.uid, 'RECORD_PAYMENT', `Recorded payment of ₹${numAmount} for member ${member.memberName} (${member.shortId || member.id})`);
      
      toast.success('Payment recorded successfully');
      
      // Auto-generate invoice
      generateInvoicePDF(gymData, updatedMember, paymentRecord);

      if (onPaymentSuccess) {
        onPaymentSuccess(paymentRecord, updatedMember);
      }
      onClose();
      setAmount('');
      setNotes('');
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '440px',
        position: 'relative', boxShadow: 'var(--shadow-xl)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '24px', right: '24px',
          background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-2)', cursor: 'pointer', transition: '0.2s'
        }}>
          <X size={18} />
        </button>

        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign color="var(--primary)" /> Record Payment
        </h3>
        <p style={{ margin: '0 0 24px 0', color: 'var(--text-3)', fontSize: '14px' }}>
          Payment for {member.memberName}
        </p>

        <div style={{
          background: 'rgba(124, 92, 255, 0.05)', borderRadius: '16px', padding: '16px',
          marginBottom: '24px', border: '1px solid rgba(124, 92, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-2)' }}>Total Fee</span>
            <span style={{ fontWeight: 600 }}>₹{membershipFee}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-2)' }}>Already Paid</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{amountPaid}</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
            <span style={{ color: '#FF5E7E', fontWeight: 600 }}>Balance Remaining</span>
            <span style={{ color: '#FF5E7E', fontWeight: 800 }}>₹{balance}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Amount to Pay (₹)</label>
            <input 
              type="number" 
              className="input" 
              placeholder="e.g. 500"
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              autoFocus
              max={balance}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Payment Method</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Cash', 'UPI', 'Card'].map(m => (
                <div 
                  key={m}
                  onClick={() => setMethod(m)}
                  style={{
                    flex: 1, padding: '12px', textAlign: 'center', borderRadius: '12px',
                    border: method === m ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: method === m ? 'rgba(124, 92, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', transition: '0.2s', fontWeight: 600,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    color: method === m ? '#fff' : 'var(--text-2)'
                  }}
                >
                  {m === 'Cash' ? <Wallet size={18} /> : m === 'UPI' ? <DollarSign size={18} /> : <CreditCard size={18} />}
                  {m}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label>Notes (Optional)</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. Paid to front desk"
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            disabled={isSubmitting || balance <= 0}
          >
            {isSubmitting ? 'Recording...' : 'Confirm Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
