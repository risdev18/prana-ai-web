import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Zap } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '1.5rem', marginBottom: '40px' }}>
        <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={24} color="#fff" />
        </div>
        PRANA AI
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Let's set up your gym</h2>
        <p className="text-muted text-center" style={{ marginBottom: '32px' }}>Complete these simple steps to get started.</p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: step >= 1 ? 'rgba(99,102,241,0.1)' : 'var(--bg)', border: step === 1 ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
            <CheckCircle2 size={24} color={step > 1 ? 'var(--success)' : 'var(--text-3)'} />
            <div>
              <div style={{ fontWeight: 600 }}>1. Gym Profile</div>
              <div className="text-muted text-sm">Basic details and branding</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: step >= 2 ? 'rgba(99,102,241,0.1)' : 'var(--bg)', border: step === 2 ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
            <CheckCircle2 size={24} color={step > 2 ? 'var(--success)' : 'var(--text-3)'} />
            <div>
              <div style={{ fontWeight: 600 }}>2. Staff & Trainers</div>
              <div className="text-muted text-sm">Add your team members</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: step >= 3 ? 'rgba(99,102,241,0.1)' : 'var(--bg)', border: step === 3 ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
            <CheckCircle2 size={24} color={step > 3 ? 'var(--success)' : 'var(--text-3)'} />
            <div>
              <div style={{ fontWeight: 600 }}>3. Add First Member</div>
              <div className="text-muted text-sm">Kickstart your database</div>
            </div>
          </div>
        </div>

        <button className="btn btn-primary w-full" onClick={handleNext}>
          {step === 3 ? 'Finish & Go to Dashboard' : 'Continue'} <ChevronRight size={18} />
        </button>
        
        {step < 3 && (
          <button className="btn btn-ghost w-full mt-2" onClick={() => navigate('/dashboard')}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
