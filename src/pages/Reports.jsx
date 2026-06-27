import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToTransactions } from '../services/firestoreService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    if (currentUser) {
      const unsub = subscribeToTransactions(currentUser.uid, setTransactions);
      return () => unsub();
    }
  }, [currentUser]);

  // Build real monthly data from last 6 months of transactions
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthStr = d.toLocaleString('default', { month: 'short' });

    const income = transactions
      .filter(t => {
        const td = new Date(t.createdAt || t.date || 0);
        return td.getFullYear() === year && td.getMonth() === month && (t.type !== 'expense');
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const expense = transactions
      .filter(t => {
        const td = new Date(t.createdAt || t.date || 0);
        return td.getFullYear() === year && td.getMonth() === month && t.type === 'expense';
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return { month: monthStr, income, expense };
  });

  // Current month stats
  const now = new Date();
  const thisMonthTxns = transactions.filter(t => {
    const td = new Date(t.createdAt || t.date || 0);
    return td.getFullYear() === now.getFullYear() && td.getMonth() === now.getMonth();
  });
  const mtdIncome = thisMonthTxns.filter(t => t.type !== 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const mtdExpense = thisMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const mtdProfit = mtdIncome - mtdExpense;

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-head)', lineHeight: 1.2 }}>Financial Reports</h1>
          <p style={{ color: 'var(--text-2)' }}>Track your gym's revenue, expenses, and profits.</p>
        </div>
        <button className="btn btn-outline" style={{ width: 'auto' }}>
          <Download size={18} /> Export PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(6,214,160,0.1)', color: 'var(--success)', padding: '10px', borderRadius: '10px' }}>
              <TrendingUp size={24} />
            </div>
            <div style={{ color: 'var(--text-2)', fontWeight: 600 }}>Total Income (MTD)</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
            {mtdIncome > 0 ? `₹${mtdIncome.toLocaleString('en-IN')}` : '₹0'}
          </div>
          {mtdIncome === 0 && <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '8px' }}>No transactions recorded this month yet.</div>}
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--error)', padding: '10px', borderRadius: '10px' }}>
              <TrendingDown size={24} />
            </div>
            <div style={{ color: 'var(--text-2)', fontWeight: 600 }}>Total Expenses (MTD)</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
            {mtdExpense > 0 ? `₹${mtdExpense.toLocaleString('en-IN')}` : '₹0'}
          </div>
          {mtdExpense === 0 && <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '8px' }}>No expenses recorded this month yet.</div>}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', padding: '10px', borderRadius: '10px' }}>
              <DollarSign size={24} />
            </div>
            <div style={{ color: 'var(--text-2)', fontWeight: 600 }}>Net Profit (MTD)</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-head)', fontWeight: 800, color: mtdProfit >= 0 ? 'var(--primary-light)' : 'var(--error)' }}>
            {mtdProfit >= 0 ? `₹${mtdProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(mtdProfit).toLocaleString('en-IN')}`}
          </div>
          {mtdIncome === 0 && mtdExpense === 0 && <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '8px' }}>Add transactions to track profit.</div>}
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Income vs Expenses (Last 6 Months)</h3>
        <p style={{ color: 'var(--text-3)', fontSize: '13px', marginBottom: '24px' }}>
          {transactions.length === 0 ? 'No transactions found. Add payments/expenses to see chart data.' : 'Based on your recorded transactions.'}
        </p>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-3)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-3)" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip 
                contentStyle={{ background: '#0d0d1f', border: '1px solid var(--border)', borderRadius: '10px' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, undefined]}
              />
              <Bar dataKey="income" name="Income" fill="var(--success)" radius={[4,4,0,0]} barSize={30} />
              <Bar dataKey="expense" name="Expense" fill="var(--error)" radius={[4,4,0,0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-md)',
        marginBottom: '40px'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-head)' }}>Recent Transactions</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>Total: {transactions.length} record(s)</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 20px', color: 'var(--text-3)', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-3)', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-3)', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Method</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-3)', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description/Notes</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-3)', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13.5px' }}>
                    No transactions found. Recorded income and expenses will display here.
                  </td>
                </tr>
              ) : (
                transactions.map((t, idx) => {
                  const isExpense = t.type === 'expense';
                  const dateVal = t.date || (t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : 'N/A');
                  return (
                    <tr key={t.id || idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#fff' }}>{dateVal}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${isExpense ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '10.5px', padding: '2px 8px' }}>
                          {isExpense ? 'Expense' : 'Income'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-2)' }}>{t.method || 'N/A'}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-2)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.notes || 'No description'}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 700, color: isExpense ? 'var(--error)' : 'var(--success)', textAlign: 'right' }}>
                        {isExpense ? '-' : '+'} ₹{Number(t.amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default Reports;
