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

  // Dummy data for visual presentation while actual transactions array is built up
  const monthlyData = [
    { month: 'Jan', income: 45000, expense: 12000 },
    { month: 'Feb', income: 52000, expense: 14000 },
    { month: 'Mar', income: 48000, expense: 13500 },
    { month: 'Apr', income: 61000, expense: 15000 },
    { month: 'May', income: 59000, expense: 18000 },
    { month: 'Jun', income: 75000, expense: 20000 },
  ];

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
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>₹75,000</div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--error)', padding: '10px', borderRadius: '10px' }}>
              <TrendingDown size={24} />
            </div>
            <div style={{ color: 'var(--text-2)', fontWeight: 600 }}>Total Expenses (MTD)</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>₹20,000</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', padding: '10px', borderRadius: '10px' }}>
              <DollarSign size={24} />
            </div>
            <div style={{ color: 'var(--text-2)', fontWeight: 600 }}>Net Profit (MTD)</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--primary-light)' }}>₹55,000</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Income vs Expenses (Last 6 Months)</h3>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-3)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-3)" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip 
                contentStyle={{ background: '#0d0d1f', border: '1px solid var(--border)', borderRadius: '10px' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="income" name="Income" fill="var(--success)" radius={[4,4,0,0]} barSize={30} />
              <Bar dataKey="expense" name="Expense" fill="var(--error)" radius={[4,4,0,0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
};

export default Reports;
