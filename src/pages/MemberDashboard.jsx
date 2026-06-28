import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Target, Dumbbell, Apple, Moon, Droplets, Zap, TrendingUp, User, Edit3, MessageCircle, X, Send, MessageSquare, CheckCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { updateMember, saveAssessment, addQuery } from '../services/firestoreService';
import { generateAssessment } from '../core/calculator';

// ─── 3D BODY MODEL ───────────────────────────────────────────────────────────
const BodyModel = ({ bmi, gender, height: h, weight: w, bmiColor }) => {
  const isFemale = (gender || '').toLowerCase() === 'female';
  const safeBmi  = bmi || 22;
  const gPrefix  = isFemale ? 'female' : 'male';

  // Pick image based on BMI category
  let suffix = 'normal';
  if (safeBmi < 18.5)  suffix = 'slim';
  else if (safeBmi < 25) suffix = 'normal';
  else suffix = 'heavy';

  const imgSrc = `/${gPrefix}_${suffix}.png`.replace('female_', 'body_female_').replace('male_', 'body_male_');

  // BMI label
  const bmiLabel = safeBmi < 18.5 ? 'Underweight' : safeBmi < 25 ? 'Healthy' : safeBmi < 30 ? 'Overweight' : 'Obese';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 3D body image */}
      <img
        src={imgSrc}
        alt={`${gPrefix} body model`}
        style={{
          width: '100%', height: '100%', objectFit: 'contain',
          filter: `drop-shadow(0 0 20px ${bmiColor}70)`,
          animation: 'float-body 4s ease-in-out infinite'
        }}
      />
      {/* Measurement overlays */}
      {h && <div style={{
        position: 'absolute', top: '8%', right: '-8px',
        fontSize: '0.7rem', fontWeight: 800, color: bmiColor,
        background: `${bmiColor}20`, border: `1px solid ${bmiColor}50`,
        borderRadius: '6px', padding: '2px 6px',
        backdropFilter: 'blur(4px)'
      }}>{h} cm</div>}
      {w && <div style={{
        position: 'absolute', bottom: '22%', left: '-8px',
        fontSize: '0.7rem', fontWeight: 800, color: '#06d6a0',
        background: 'rgba(6,214,160,0.15)', border: '1px solid rgba(6,214,160,0.4)',
        borderRadius: '6px', padding: '2px 6px',
        backdropFilter: 'blur(4px)'
      }}>{w} kg</div>}
      {/* BMI badge */}
      <div style={{
        position: 'absolute', bottom: '2%',
        background: `${bmiColor}25`, border: `1px solid ${bmiColor}60`,
        borderRadius: '999px', padding: '3px 10px',
        fontSize: '0.65rem', fontWeight: 800, color: bmiColor,
        letterSpacing: '0.06em'
      }}>{bmiLabel}</div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const MemberDashboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.member) {
    navigate('/member-portal');
    return null;
  }

  const { member, gym } = state;

  const [isEditing, setIsEditing] = useState(false);
  const [editWeight, setEditWeight] = useState(member.weight || '');
  const [editGoal, setEditGoal] = useState(member.goal || 'Maintain Fitness');
  const [saveLoading, setSaveLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // Query submission state
  const [queryType, setQueryType] = useState('Query');
  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [querySuccess, setQuerySuccess] = useState(false);

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!querySubject.trim() || !queryMessage.trim()) return;
    setQueryLoading(true);
    try {
      await addQuery(gym.gymId, {
        memberName: member.memberName,
        memberId: member.memberId,
        memberPhone: member.phone || '',
        type: queryType,
        subject: querySubject.trim(),
        message: queryMessage.trim(),
      });
      setQuerySubject('');
      setQueryMessage('');
      setQuerySuccess(true);
      setTimeout(() => setQuerySuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Please try again.');
    } finally {
      setQueryLoading(false);
    }
  };

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { text: `Hi ${member.memberName}! I'm Prana AI 🤖. How can I help you crush your ${member.goal} goal today?`, isAi: true }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { text: userMsg, isAi: false }]);
    setChatInput('');
    
    setTimeout(() => {
      let reply = "That's a great question! Stay consistent with your routine.";
      if (userMsg.toLowerCase().includes('barbell') || userMsg.toLowerCase().includes('squat')) {
        reply = "If you don't have a barbell for squats, you can do Bulgarian Split Squats using dumbbells, or bodyweight jump squats for explosive power!";
      } else if (userMsg.toLowerCase().includes('protein') || userMsg.toLowerCase().includes('calories')) {
        reply = "For your goal, prioritize lean proteins like chicken breast, eggs, or lentils. Aim for at least 1.6g of protein per kg of bodyweight!";
      } else {
        reply = `Keep pushing towards your ${member.goal}! Remember, 80% of results come from your diet. Need any specific exercise swaps?`;
      }
      setMessages(prev => [...prev, { text: reply, isAi: true }]);
    }, 1000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const w = parseFloat(editWeight);
      if (isNaN(w) || w <= 0) return alert('Invalid weight');

      const newMemberData = { ...member, weight: w, goal: editGoal };
      const newAssessment = generateAssessment(newMemberData);
      newAssessment.assessmentId = Date.now().toString();

      await updateMember(gym.gymId, newMemberData);
      await saveAssessment(gym.gymId, member.memberId, newAssessment);
      
      setIsEditing(false);
      navigate('/member-dashboard', { state: { member: newMemberData, gym }, replace: true });
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert('Photo must be less than 2MB. Please choose a smaller image.');
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const newMemberData = { ...member, photoUrl: reader.result };
        await updateMember(gym.gymId, newMemberData);
        navigate('/member-dashboard', { state: { member: newMemberData, gym }, replace: true });
      } catch (err) {
        console.error('Error uploading photo', err);
        alert('Failed to save photo');
      }
    };
    reader.readAsDataURL(file);
  };

  const getBmiColor = (bmi) => {
    if (!bmi) return '#6366f1';
    if (bmi < 18.5) return '#06b6d4';
    if (bmi < 25) return '#06d6a0';
    if (bmi < 30) return '#f59e0b';
    return '#f43f5e';
  };

  const getBmiLabel = (bmi) => {
    if (!bmi) return 'N/A';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal ✓';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBmiAdvice = (bmi) => {
    if (!bmi) return 'No BMI data recorded yet.';
    if (bmi < 18.5) return 'Focus on calorie surplus and strength training to build muscle mass.';
    if (bmi < 25) return 'Great shape! Maintain with regular exercise and balanced nutrition.';
    if (bmi < 30) return 'Reduce calorie intake slightly and increase cardio sessions.';
    return 'Consult your trainer for a structured weight-loss program.';
  };

  const bmiColor = getBmiColor(member.bmi);
  const bmiPct = Math.min(((member.bmi || 20) / 40) * 100, 100);

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  // Diet suggestions based on goal
  const dietPlan = {
    'Weight Loss': {
      breakfast: 'Oats + 2 boiled eggs + green tea',
      lunch: 'Grilled chicken + salad + brown rice',
      dinner: 'Dal + veggies + 1 chapati',
      snack: 'Fruits + nuts',
      water: '3–4 litres/day',
      calories: '1600–1800 kcal'
    },
    'Muscle Gain': {
      breakfast: 'Eggs + milk + banana + oats',
      lunch: 'Chicken breast + rice + veggies',
      dinner: 'Paneer/fish + daal + 2 chapati',
      snack: 'Peanut butter + protein shake',
      water: '3–5 litres/day',
      calories: '2800–3200 kcal'
    },
    'Maintain Fitness': {
      breakfast: 'Eggs + toast + fruits',
      lunch: 'Balanced meal + salad',
      dinner: 'Light meal + soup',
      snack: 'Yogurt + nuts',
      water: '2.5–3 litres/day',
      calories: '2000–2200 kcal'
    },
    'default': {
      breakfast: 'Nutritious breakfast with protein',
      lunch: 'Balanced lunch with veggies',
      dinner: 'Light dinner',
      snack: 'Healthy snacks',
      water: '2.5–3 litres/day',
      calories: '2000 kcal'
    }
  };

  // Workout plan based on goal
  const workoutPlan = {
    'Weight Loss': ['30 min cardio (running/cycling)', 'Circuit training 3x/week', 'HIIT sessions 2x/week', 'Yoga/stretching daily'],
    'Muscle Gain': ['Compound lifts (bench, squat, deadlift)', 'Progressive overload training', 'Rest 48hrs between muscle groups', 'Protein shake post-workout'],
    'Maintain Fitness': ['3x cardio/week', '2x strength training/week', 'Flexibility exercises', 'Active rest days (walking)'],
    'default': ['3–4 gym sessions/week', 'Cardio + strength balance', 'Consistency is key', 'Track your progress']
  };

  const diet = dietPlan[member.goal] || dietPlan['default'];
  const workout = workoutPlan[member.goal] || workoutPlan['default'];

  // Build the QR content as a valid URL so Google Lens can scan and open it!
  const qrValue = `${window.location.origin}/member-portal`;

  return (
    <div style={{ minHeight: '100vh', padding: '0 20px 60px', position: 'relative', overflow: 'hidden' }}>

      {/* ─── DIGITAL MEMBER ID CARD (HORIZONTAL GYM CARD) ─── */}
      {showCard && (
        <div
          onClick={() => setShowCard(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* ══ MEMBERSHIP CARD — horizontal landscape credit card style ══ */}
            <div style={{
              width: '100%', aspectRatio: '1.75 / 1', borderRadius: '20px',
              overflow: 'hidden', position: 'relative',
              background: 'linear-gradient(135deg, #0a0c14 0%, #0f1620 45%, #0b0e1a 100%)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06), 0 0 40px rgba(0,220,100,0.08)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>

              {/* Glossy top shine */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)', pointerEvents: 'none' }} />

              {/* Left green accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '5px', background: 'linear-gradient(180deg, #00ff88 0%, #00cc55 50%, #005522 100%)', borderRadius: '20px 0 0 20px' }} />

              {/* Watermark muscle silhouette */}
              <div style={{ position: 'absolute', right: '110px', top: '50%', transform: 'translateY(-50%)', fontSize: '5rem', opacity: 0.04, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>💪</div>

              {/* TOP ROW: Gym name left + logo right */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 0 20px' }}>
                <div>
                  <div style={{ fontSize: '0.5rem', color: '#00cc55', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '1px' }}>FITNESS MEMBERSHIP CARD</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-head)', letterSpacing: '0.02em', lineHeight: 1 }}>
                    {gym?.gymName || 'FITNESS GYM'}
                  </div>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #00cc55, #004d22)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,204,85,0.35)' }}>
                  <Dumbbell size={18} color="#fff" />
                </div>
              </div>

              {/* MIDDLE ROW: Photo + Details + QR */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', padding: '8px 14px 12px 20px' }}>

                {/* Photo box */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '65px', height: '75px', borderRadius: '8px', border: '2px solid #00cc55', overflow: 'hidden', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(0,204,85,0.25)' }}>
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.memberName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={26} color="rgba(255,255,255,0.25)" />
                    )}
                  </div>
                  <label title="Upload photo" style={{ position: 'absolute', inset: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', opacity: 0, cursor: 'pointer', transition: 'opacity 0.2s', fontSize: '0.5rem', color: '#fff', fontWeight: 700, textAlign: 'center', letterSpacing: '0.04em' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                    📷<br/>CHANGE
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* Member details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.42rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1px' }}>MEMBER NAME</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-head)', letterSpacing: '0.01em', marginBottom: '8px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.memberName}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px' }}>
                    {[
                      { label: 'MEMBER ID', value: member.shortId || 'N/A', color: '#00ff88' },
                      { label: 'VALID THRU', value: member.membershipEndDate ? new Date(member.membershipEndDate).toLocaleDateString('en-GB') : 'N/A', color: '#fff' },
                      { label: 'PLAN', value: member.goal || 'Standard', color: '#fff' },
                      { label: 'SINCE', value: member.membershipStartDate ? new Date(member.membershipStartDate).toLocaleDateString('en-GB') : '—', color: '#fff' },
                    ].map(d => (
                      <div key={d.label}>
                        <div style={{ fontSize: '0.38rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{d.label}</div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: d.color, fontFamily: d.label === 'MEMBER ID' ? 'monospace' : 'inherit' }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code — compact on right */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <div style={{ background: '#fff', padding: '5px', borderRadius: '7px', boxShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>
                    <QRCode value={member.memberId || 'unknown'} size={66} level="Q" fgColor="#000" bgColor="#fff" style={{ display: 'block' }} />
                  </div>
                  <div style={{ fontSize: '0.35rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>SCAN TO<br/>VERIFY</div>
                </div>
              </div>

              {/* Bottom green accent strip */}
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #00ff88 0%, #00cc55 50%, transparent 100%)' }} />
            </div>

            {/* Add photo prompt if no photo */}
            {!member.photoUrl && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(0,204,85,0.08)', border: '1px dashed rgba(0,204,85,0.35)', color: '#00cc55', fontSize: '0.82rem', fontWeight: 600 }}>
                📷 Tap here to add your photo to the card
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}

            {/* Close button */}
            <button onClick={() => setShowCard(false)} style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font)' }}>
              Close Card
            </button>
          </div>
        </div>
      )}
      {/* BG Image */}
      <div style={{
         position: 'fixed', inset: 0,
         backgroundImage: 'url("https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop")',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         opacity: 0.15,
         filter: 'contrast(1.2) grayscale(0.2)',
         mixBlendMode: 'screen',
         pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* HEADER */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '20px 0', marginBottom: '20px',
          borderBottom: '1px solid var(--border)'
        }}>
          <button
            onClick={() => navigate('/member-portal')}
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text)', flexShrink: 0
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {gym?.gymName}
            </div>
            <h1 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>My Fitness Profile</h1>
          </div>
        </div>

        {/* PROFILE HERO CARD */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 60%, rgba(6,214,160,0.05) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '20px', padding: '28px',
          marginBottom: '20px', position: 'relative', overflow: 'hidden'
        }} className="animate-fade-up">
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)'
          }} />
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {/* BODY SILHOUETTE AVATAR */}
            <div style={{
              width: '90px', height: '160px', flexShrink: 0,
              filter: `drop-shadow(0 0 12px ${bmiColor}60)`
            }}>
              <BodyModel
                bmi={member.bmi}
                gender={member.gender}
                bmiColor={bmiColor}
                height={member.height}
                weight={member.weight}
              />
            </div>
            
            {/* QR Button */}
            <button
              onClick={() => setShowCard(true)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: '14px', padding: '10px 14px',
                cursor: 'pointer', color: '#fff', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '4px', flexShrink: 0,
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <span style={{ fontSize: '1.4rem' }}>📲</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>MY CARD</span>
            </button>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-head)', marginBottom: '4px' }}>
                {member.memberName}
              </h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span style={{
                  background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  padding: '3px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600
                }}>
                  🎯 {member.goal}
                </span>
                {member.age && (
                  <span style={{
                    background: 'rgba(255,255,255,0.06)', color: 'var(--text-2)',
                    border: '1px solid var(--border)',
                    padding: '3px 12px', borderRadius: '999px', fontSize: '0.78rem'
                  }}>
                    Age: {member.age}
                  </span>
                )}
                {member.gender && (
                  <span style={{
                    background: 'rgba(255,255,255,0.06)', color: 'var(--text-2)',
                    border: '1px solid var(--border)',
                    padding: '3px 12px', borderRadius: '999px', fontSize: '0.78rem'
                  }}>
                    {member.gender}
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Weight', value: member.weight ? `${member.weight} kg` : 'N/A' },
                  { label: 'Height', value: member.height ? `${member.height} cm` : 'N/A' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ color: 'var(--text-3)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              marginTop: '20px', width: '100%', padding: '12px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', color: 'var(--text)', fontFamily: 'var(--font)',
              fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Edit3 size={16} /> Update Progress
          </button>
        </div>

        {/* EDIT FORM */}
        {isEditing && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '22px', marginBottom: '20px'
          }} className="animate-fade-up">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Update Your Stats</h3>
            <form onSubmit={handleUpdate}>
              <div className="grid-2" style={{ gap: '14px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Current Weight (kg)</label>
                  <input
                    type="number" className="form-control" required
                    value={editWeight} onChange={e => setEditWeight(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Fitness Goal</label>
                  <select className="form-control" value={editGoal} onChange={e => setEditGoal(e.target.value)}>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Maintain Fitness">Maintain Fitness</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saveLoading}>
                  {saveLoading ? 'Saving...' : 'Save & Recalculate'}
                </button>
              </div>
            </form>
          </div>
        )}




        {/* BMI CARD */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${bmiColor}40`,
          borderRadius: '16px', padding: '22px',
          marginBottom: '16px'
        }} className="animate-fade-up-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${bmiColor}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Activity size={20} color={bmiColor} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Body Mass Index</div>
                <div style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>Your current BMI status</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: bmiColor }}>
                {member.bmi?.toFixed(1) || 'N/A'}
              </div>
              <div style={{
                background: `${bmiColor}20`, color: bmiColor,
                border: `1px solid ${bmiColor}40`,
                padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600
              }}>
                {getBmiLabel(member.bmi)}
              </div>
            </div>
          </div>

          {/* BMI Scale Bar */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.72rem', color: 'var(--text-3)' }}>
              <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
            </div>
            <div style={{ height: '10px', borderRadius: '999px', background: 'linear-gradient(90deg, #06b6d4 0%, #06d6a0 35%, #f59e0b 65%, #f43f5e 100%)', position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '-3px',
                left: `${bmiPct}%`,
                transform: 'translateX(-50%)',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#fff', border: `3px solid ${bmiColor}`,
                boxShadow: `0 0 10px ${bmiColor}80`
              }} />
            </div>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '10px' }}>{getBmiAdvice(member.bmi)}</p>
        </div>

        {/* WORKOUT PLAN */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px', padding: '22px',
          marginBottom: '16px'
        }} className="animate-fade-up-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Dumbbell size={20} color="var(--primary-light)" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Your Workout Plan</div>
              <div style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>Based on your goal: {member.goal}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {workout.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px',
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.12)'
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'rgba(99,102,241,0.2)', color: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem', flexShrink: 0
                }}>{i + 1}</div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DIET PLAN */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px', padding: '22px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(6,214,160,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Apple size={20} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Diet Plan</div>
              <div style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>Target: {diet.calories}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { icon: '🌅', label: 'Breakfast', value: diet.breakfast },
              { icon: '☀️', label: 'Lunch', value: diet.lunch },
              { icon: '🌙', label: 'Dinner', value: diet.dinner },
              { icon: '🍎', label: 'Snack', value: diet.snack },
            ].map(m => (
              <div key={m.label} style={{
                padding: '14px', borderRadius: '10px',
                background: 'rgba(6,214,160,0.06)',
                border: '1px solid rgba(6,214,160,0.12)'
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{m.icon}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>{m.label}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Water intake */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginTop: '12px', padding: '12px 14px', borderRadius: '10px',
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)'
          }}>
            <Droplets size={20} color="#06b6d4" />
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#06b6d4' }}>Daily Water: </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{diet.water}</span>
            </div>
          </div>
        </div>

        {/* TIPS */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.06))',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '16px', padding: '22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Zap size={20} color="var(--gold)" />
            <div style={{ fontWeight: 700 }}>Pro Tips for You</div>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              '💤 Sleep 7–8 hours for optimal recovery',
              '📊 Track your progress weekly',
              '🧘 Warm up before every session',
              '💊 Stay consistent — results take time!',
            ].map(tip => (
              <li key={tip} style={{
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.06)',
                fontSize: '0.87rem', color: 'var(--text-2)'
              }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* QUERY / COMPLAINT SUBMISSION */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px', padding: '22px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <MessageSquare size={20} color="var(--primary-light)" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Raise a Query or Complaint</div>
              <div style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>Your gym team will respond on WhatsApp</div>
            </div>
          </div>

          {querySuccess ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px', borderRadius: '12px',
              background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.25)'
            }}>
              <CheckCircle size={22} color="var(--accent)" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--accent)' }}>Query submitted!</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Your gym team will follow up with you shortly.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitQuery}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                {['Query', 'Complaint', 'Feedback', 'Suggestion'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => setQueryType(t)}
                    style={{
                      padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                      border: '1px solid',
                      background: queryType === t ? 'var(--primary)' : 'transparent',
                      borderColor: queryType === t ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                      color: queryType === t ? '#fff' : 'var(--text-2)',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >{t}</button>
                ))}
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text" className="form-control"
                  placeholder="e.g. Equipment broken, trainer issue..."
                  value={querySubject}
                  onChange={e => setQuerySubject(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Message</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Describe your query or complaint in detail..."
                  value={queryMessage}
                  onChange={e => setQueryMessage(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={queryLoading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {queryLoading ? 'Submitting...' : <><Send size={16} /> Submit {queryType}</>}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* PRANA AI CHATBOT UI */}
      {/* Floating Button */}
      <button
        onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 100,
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #f72585, #7209b7)',
          border: 'none', color: '#fff', cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(247,37,133,0.5)',
          display: chatOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse-glow 2s infinite'
        }}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <div style={{
        position: 'fixed', bottom: chatOpen ? '30px' : '-600px', right: '30px', zIndex: 101,
        width: '350px', height: '500px', borderRadius: '24px',
        background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* Chat Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f72585, #7209b7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}><Zap size={18} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Prana AI</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>Online</div>
            </div>
          </div>
          <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              alignSelf: msg.isAi ? 'flex-start' : 'flex-end',
              maxWidth: '85%', padding: '12px 16px',
              borderRadius: msg.isAi ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
              background: msg.isAi ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: msg.isAi ? '1px solid rgba(255,255,255,0.1)' : 'none',
              color: '#fff', fontSize: '0.9rem', lineHeight: '1.4'
            }}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <form onSubmit={handleChat} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask Prana AI..."
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--primary)', border: 'none', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default MemberDashboard;
