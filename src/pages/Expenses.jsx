import React, { useState, useEffect } from 'react';
import { Plus, Trash2, PieChart, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { addTransaction, logAudit } from '../services/firestoreService';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ['Rent', 'Electricity', 'Salary', 'Equipment', 'Repair', 'Cleaning', 'Miscellaneous'];

const Expenses = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, 'Gyms', currentUser.uid, 'Expenses'),
        orderBy('date', 'desc')
      );
      const unsub = onSnapshot(q, (snapshot) => {
        setExpenses(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
      });
      return () => unsub();
    }
  }, [currentUser]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    
    try {
      const expenseDate = new Date().toISOString();
      await addDoc(collection(db, 'Gyms', currentUser.uid, 'Expenses'), {
        title,
        amount: Number(amount),
        category,
        notes,
        date: expenseDate,
        createdAt: serverTimestamp()
      });
      
      // Also log as a transaction for Reports
      await addTransaction(currentUser.uid, {
        amount: Number(amount),
        type: 'expense',
        method: 'Cash', // Defaulting for simplicity, or we could add a dropdown
        notes: `Expense: ${title} (${category})`,
        date: expenseDate
      });
      
      toast.success('Expense added successfully');
      setShowAdd(false);
      setTitle(''); setAmount(''); setNotes('');
    } catch (err) {
      toast.error('Failed to add expense');
    }
  };

  const handleDelete = async (id, title, amount) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteDoc(doc(db, 'Gyms', currentUser.uid, 'Expenses', id));
      await logAudit(currentUser.uid, currentUser.uid, 'DELETE_EXPENSE', `Deleted expense: ${title} (₹${amount})`);
      toast.success('Expense deleted');
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const totalMonthly = expenses
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF5E7E, #FF9B8B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255,94,126,0.3)'
            }}>
              <DollarSign size={20} color="#fff" />
            </div>
            <h2 style={{ margin: 0 }}>Expenses</h2>
          </div>
          <p style={{ margin: 0, color: 'var(--text-3)' }}>Track your gym operating costs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ gap: '8px' }}>
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div style={{
            background: 'rgba(255,94,126,0.08)', border: `1px solid rgba(255,94,126,0.2)`,
            borderRadius: '20px', padding: '22px 24px', backdropFilter: 'blur(16px)'
        }}>
          <div style={{ fontSize: '13px', color: '#FF5E7E', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>This Month's Total</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FF5E7E' }}>₹{totalMonthly}</div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', overflow: 'hidden'
      }}>
        {expenses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
            No expenses recorded yet.
          </div>
        ) : (
          <div>
            {expenses.map(e => (
              <div key={e.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 24px', borderBottom: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{e.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span className="badge badge-purple" style={{ fontSize: '10px' }}>{e.category}</span>
                    <span>{new Date(e.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#FF5E7E', fontSize: '16px' }}>- ₹{e.amount}</div>
                  <button onClick={() => handleDelete(e.id, e.title, e.amount)} style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
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
            <h3 style={{ marginTop: 0 }}>Add Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Title / Description</label>
                <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Amount (₹)</label>
                <input type="number" className="input" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Category</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Notes</label>
                <input type="text" className="input" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
