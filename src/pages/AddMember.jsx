import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Ruler, Weight, Target, Activity, Phone } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GENDERS, ACTIVITY_LEVELS, GOALS } from '../core/constants';
import { generateAssessment } from '../core/calculator';
import { useAuth } from '../contexts/AuthContext';

const GOAL_ICONS = {
  'Weight Loss': '🔥',
  'Muscle Gain': '💪',
  'Maintain Fitness': '⚡',
};

const ACTIVITY_DESC = {
  'Sedentary': 'Little or no exercise',
  'Lightly Active': 'Light exercise 1-3 days/week',
  'Moderately Active': 'Moderate exercise 3-5 days/week',
  'Very Active': 'Hard exercise 6-7 days/week',
  'Extra Active': 'Very hard exercise & physical job',
};

const InputWrap = ({ icon, children }) => (
  <div style={{ position: 'relative' }}>
    <div style={{
      position: 'absolute', left: '14px', top: '50%',
      transform: 'translateY(-50%)', color: 'var(--text-3)',
      display: 'flex', alignItems: 'center', pointerEvents: 'none'
    }}>{icon}</div>
    {children}
  </div>
);

const AddMember = () => {
  const navigate = useNavigate();
  const { gymData } = useAuth();
  
  // Default to today for start date, and +1 month for end date
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    memberName: '',
    phone: '',
    age: '',
    gender: GENDERS.MALE,
    startDate: today,
    endDate: nextMonthStr,
    height: '',
    weight: '',
    activityLevel: ACTIVITY_LEVELS.MODERATELY_ACTIVE,
    goal: GOALS.MAINTAIN,
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setError('');
    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);

    if (!formData.memberName.trim()) return setError('Member name is required');
    if (isNaN(age) || age <= 0 || age > 120) return setError('Enter a valid age (1–120)');
    if (isNaN(height) || height <= 0 || height > 300) return setError('Enter a valid height (1–300 cm)');
    if (isNaN(weight) || weight <= 0 || weight > 500) return setError('Enter a valid weight (1–500 kg)');

    // Generate unique shortId based on Gym Name
    const gymName = gymData?.gymName || 'GYM';
    const prefix = gymName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,4);
    const shortId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const memberInput = {
      memberId: uuidv4(),
      shortId,
      memberName: formData.memberName.trim(),
      phone: formData.phone,
      age, gender: formData.gender,
      membershipStartDate: formData.startDate,
      membershipEndDate: formData.endDate,
      height, weight,
      startingWeight: weight,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      createdAt: new Date().toISOString(),
    };

    const assessmentResult = generateAssessment(memberInput);
    navigate('/assessment', { state: { assessment: assessmentResult, isNew: true } });
  };

  return (
    <div style={{ minHeight: '100vh', padding: '0 20px 60px', position: 'relative', overflow: 'hidden' }}>
      {/* BG Image */}
      <div style={{
         position: 'fixed', inset: 0,
         backgroundImage: 'url("https://images.unsplash.com/photo-1599058945522-28d584b6f4ff?q=80&w=2069&auto=format&fit=crop")',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         opacity: 0.15,
         filter: 'contrast(1.2) grayscale(0.2)',
         mixBlendMode: 'screen',
         pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '20px 0', marginBottom: '24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text)', flexShrink: 0
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-head)', marginBottom: '2px' }}>
              Add New Member
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
              Fill details to generate fitness assessment
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: '12px', padding: '14px 18px',
            color: 'var(--error)', fontSize: '0.9rem', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleGenerate}>

          {/* Section: Personal Info */}
          <div className="card-glass-blue" style={{
            borderRadius: '24px', padding: '30px', marginBottom: '24px', position: 'relative', overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
              👤 Personal Information
            </h3>

            <div className="form-group">
              <label>Member Name *</label>
              <InputWrap icon={<User size={16} />}>
                <input
                  type="text" name="memberName" className="form-control" required
                  placeholder="Full name" style={{ paddingLeft: '40px' }}
                  value={formData.memberName} onChange={handleChange}
                />
              </InputWrap>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <InputWrap icon={<Phone size={16} />}>
                <input
                  type="tel" name="phone" className="form-control"
                  placeholder="10-digit mobile number" style={{ paddingLeft: '40px' }}
                  value={formData.phone} onChange={handleChange}
                />
              </InputWrap>
            </div>

            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Age *</label>
                <InputWrap icon={<span style={{ fontSize: '12px' }}>yr</span>}>
                  <input
                    type="number" name="age" className="form-control" required
                    placeholder="25" min="1" max="120" style={{ paddingLeft: '40px' }}
                    value={formData.age} onChange={handleChange}
                  />
                </InputWrap>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Gender *</label>
                <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                  {Object.values(GENDERS).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '14px', marginTop: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Join Date *</label>
                <input
                  type="date" name="startDate" className="form-control" required
                  value={formData.startDate} onChange={handleChange}
                  style={{ color: 'var(--text)' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Expiry Date *</label>
                <input
                  type="date" name="endDate" className="form-control" required
                  value={formData.endDate} onChange={handleChange}
                  style={{ color: 'var(--text)' }}
                />
              </div>
            </div>
          </div>

          {/* Section: Body Stats */}
          <div className="card-glass-green" style={{
            borderRadius: '24px', padding: '30px', marginBottom: '24px', position: 'relative', overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
              📏 Body Measurements
            </h3>
            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Height (cm) *</label>
                <InputWrap icon={<Ruler size={15} />}>
                  <input
                    type="number" name="height" className="form-control" required
                    placeholder="170" min="1" max="300" style={{ paddingLeft: '40px' }}
                    value={formData.height} onChange={handleChange}
                  />
                </InputWrap>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Weight (kg) *</label>
                <InputWrap icon={<Weight size={15} />}>
                  <input
                    type="number" name="weight" className="form-control" required
                    placeholder="70" min="1" max="500" style={{ paddingLeft: '40px' }}
                    value={formData.weight} onChange={handleChange}
                  />
                </InputWrap>
              </div>
            </div>
          </div>

          {/* Section: Fitness Goal */}
          <div className="card-glass-pink" style={{
            borderRadius: '24px', padding: '30px', marginBottom: '24px', position: 'relative', overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
              🎯 Fitness Goal
            </h3>

            {/* Goal buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {Object.values(GOALS).map(g => (
                <button
                  type="button" key={g}
                  onClick={() => setFormData(prev => ({ ...prev, goal: g }))}
                  style={{
                    flex: 1, minWidth: '120px',
                    padding: '14px 10px', borderRadius: '12px',
                    border: formData.goal === g ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: formData.goal === g ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    color: formData.goal === g ? 'var(--primary-light)' : 'var(--text-2)',
                    fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{GOAL_ICONS[g] || '🏋️'}</span>
                  {g}
                </button>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Activity Level</label>
              <select name="activityLevel" className="form-control" value={formData.activityLevel} onChange={handleChange}>
                {Object.values(ACTIVITY_LEVELS).map(a => (
                  <option key={a} value={a}>{a} — {ACTIVITY_DESC[a] || ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: '100%', padding: '20px',
              background: 'linear-gradient(135deg, #f72585, #7209b7)',
              border: 'none', borderRadius: '20px', color: '#fff',
              fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem',
              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 10px 30px rgba(247,37,133,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(247,37,133,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 10px 30px rgba(247,37,133,0.4)'; }}
          >
            <Activity size={24} /> GENERATE AI ASSESSMENT
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMember;
