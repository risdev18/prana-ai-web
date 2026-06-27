import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Save, Activity, Droplets, Flame, Dumbbell, CheckCircle, MessageCircle, Calendar, Clipboard, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addMember, saveAssessment, markAttendance } from '../services/firestoreService';
import { generateRecommendations, getBMICategory, getHealthyWeightRange } from '../core/calculator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReceiptModal from '../components/ReceiptModal';
import QRCode from 'react-qr-code';

const Assessment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { currentUser, gymData } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedMember, setSavedMember] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [attendanceCheckedIn, setAttendanceCheckedIn] = useState(false);
  const reportRef = useRef(null);

  if (!state?.assessment) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: 'var(--text-2)' }}>No assessment data found.</p>
        <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  const { assessment, isNew } = state;
  const recommendations = generateRecommendations(assessment.bmi, assessment.goal);
  const healthyRange = getHealthyWeightRange(assessment.height);

  const getBmiColor = (bmi) => {
    if (!bmi) return '#6366f1';
    if (bmi < 18.5) return '#06b6d4';
    if (bmi < 25) return '#06d6a0';
    if (bmi < 30) return '#f59e0b';
    return '#f43f5e';
  };

  const bmiColor = getBmiColor(assessment.bmi);
  const bmiPct = Math.min(((assessment.bmi || 20) / 40) * 100, 100);

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await addMember(currentUser.uid, assessment);
      await saveAssessment(currentUser.uid, assessment.memberId, {
        ...assessment,
        assessmentId: Date.now().toString(),
      });
      setSaved(true);
      setSavedMember(assessment);
    } catch (err) {
      console.error(err);
      alert('Failed to save report.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!savedMember) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await markAttendance(currentUser.uid, todayStr, savedMember.memberId, savedMember.memberName);
      setAttendanceCheckedIn(true);
    } catch (err) {
      console.error('Failed to mark attendance', err);
    }
  };

  const getWhatsAppWelcomeLink = (member) => {
    const phone = (member.phone || '').replace(/\D/g, '');
    if (!phone) return null;
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const gymName = gymData?.gymName || 'our gym';
    const startDateStr = member.membershipStartDate
      ? new Date(member.membershipStartDate).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB');
    const text =
      `🏋️‍♂️ Welcome to ${gymName}, ${member.memberName}!\n\n` +
      `Your membership has been successfully activated.\n\n` +
      `🆔 Member ID: ${member.shortId}\n` +
      `📅 Joining Date: ${startDateStr}\n\n` +
      `We're excited to be a part of your fitness journey and help you achieve your goals. Stay consistent, train hard, and remember—every workout brings you one step closer to your best self!\n\n` +
      `If you need any assistance, feel free to contact our team.\n\n` +
      `Welcome to the ${gymName} family! 💪🔥\n\n` +
      `Team ${gymName}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleDownloadPDF = async () => {
    const el = reportRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#060610' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${assessment.memberName}_Assessment.pdf`);
  };

  const MetricCard = ({ icon, label, value, sub, color = 'var(--primary-light)', bg = 'rgba(99,102,241,0.12)' }) => (
    <div style={{
      background: bg, border: `1px solid ${color}30`,
      borderRadius: '14px', padding: '18px',
      display: 'flex', alignItems: 'center', gap: '14px'
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-head)', color }}>{value}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );

  const Row = ({ label, value, highlight }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}>
      <span style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>{label}</span>
      <strong style={{ color: highlight || 'var(--text)', fontSize: '0.95rem' }}>{value}</strong>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '0 20px 60px', position: 'relative', overflow: 'hidden' }}>
      {/* BG Image */}
      <div style={{
         position: 'fixed', inset: 0,
         backgroundImage: 'url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop")',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         opacity: 0.12,
         filter: 'contrast(1.2) grayscale(0.2)',
         mixBlendMode: 'screen',
         pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 0', marginBottom: '20px', borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text)'
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>Fitness Assessment</h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{assessment.memberName}</p>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              color: 'var(--text)', padding: '9px 16px', borderRadius: '10px',
              cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.85rem', fontWeight: 600
            }}
          >
            <Download size={15} /> PDF
          </button>
        </div>

        <div ref={reportRef}>
          {/* Gym + Date header for PDF */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,214,160,0.08))',
            border: '1px solid rgba(99,102,241,0.25)', borderRadius: '16px',
            padding: '20px 24px', marginBottom: '16px', textAlign: 'center'
          }}>
            <div style={{
              fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '1.4rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              PRANA AI
            </div>
            <div style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '4px' }}>
              {gymData?.gymName || 'Fitness Assessment'} • {new Date(assessment.assessmentDate || assessment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ marginTop: '8px' }}>
              <span style={{
                background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)',
                border: '1px solid rgba(99,102,241,0.3)',
                padding: '4px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600
              }}>
                {assessment.memberName} • {assessment.goal}
              </span>
            </div>
          </div>

          {/* BMI Hero */}
          <div style={{
            background: `linear-gradient(135deg, ${bmiColor}20, transparent)`,
            border: `1px solid ${bmiColor}40`,
            borderRadius: '16px', padding: '22px', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Body Mass Index</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-head)', color: bmiColor, lineHeight: 1 }}>
                  {assessment.bmi?.toFixed(1)}
                </div>
              </div>
              <div style={{
                background: `${bmiColor}20`, border: `1px solid ${bmiColor}40`,
                borderRadius: '12px', padding: '10px 18px', textAlign: 'center'
              }}>
                <div style={{ color: bmiColor, fontWeight: 700, fontSize: '1rem' }}>{getBMICategory(assessment.bmi)}</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: '2px' }}>Category</div>
              </div>
            </div>
            {/* BMI Scale */}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
            </div>
            <div style={{ height: '8px', borderRadius: '999px', background: 'linear-gradient(90deg, #06b6d4 0%, #06d6a0 35%, #f59e0b 65%, #f43f5e 100%)', position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '-4px', left: `${bmiPct}%`,
                transform: 'translateX(-50%)',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#fff', border: `3px solid ${bmiColor}`,
                boxShadow: `0 0 8px ${bmiColor}`
              }} />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
            <MetricCard
              icon={<Flame size={20} />}
              label="Daily Calories (TDEE)"
              value={`${Math.round(assessment.tdee)} kcal`}
              color="#f59e0b"
              bg="rgba(245,158,11,0.08)"
            />
            <MetricCard
              icon={<Droplets size={20} />}
              label="Daily Water"
              value={`${assessment.water?.toFixed(1)} L`}
              color="#06b6d4"
              bg="rgba(6,182,212,0.08)"
            />
            <MetricCard
              icon={<Dumbbell size={20} />}
              label="Protein Target"
              value={`${Math.round(assessment.protein)} g`}
              color="#06d6a0"
              bg="rgba(6,214,160,0.08)"
            />
            <MetricCard
              icon={<Activity size={20} />}
              label="BMR"
              value={`${Math.round(assessment.bmr)} kcal`}
              color="#8b5cf6"
              bg="rgba(139,92,246,0.08)"
            />
          </div>

          {/* Nutrition Details */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '20px', marginBottom: '16px'
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: '4px', fontSize: '1rem' }}>🍽️ Nutrition Breakdown</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', marginBottom: '14px' }}>Calorie targets based on your goal</p>
            <Row label="Cutting (Fat Loss)" value={`${Math.round(assessment.cutCalories)} kcal`} highlight={assessment.goal === 'Weight Loss' ? '#06d6a0' : undefined} />
            <Row label="Maintenance" value={`${Math.round(assessment.tdee)} kcal`} highlight={assessment.goal === 'Maintain Fitness' ? '#06d6a0' : undefined} />
            <Row label="Bulking (Muscle Gain)" value={`${Math.round(assessment.bulkCalories)} kcal`} highlight={assessment.goal === 'Muscle Gain' ? '#06d6a0' : undefined} />
          </div>

          {/* Weight Goals */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '20px', marginBottom: '16px'
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: '14px', fontSize: '1rem' }}>⚖️ Weight Analysis</h3>
            <Row label="Current Weight" value={`${assessment.weight} kg`} />
            <Row label="Healthy Range" value={`${healthyRange.min.toFixed(1)} – ${healthyRange.max.toFixed(1)} kg`} highlight="var(--accent)" />
            {assessment.weightToLose > 0 && <Row label="To Lose" value={`${assessment.weightToLose.toFixed(1)} kg`} highlight="#f59e0b" />}
            {assessment.weightToGain > 0 && <Row label="To Gain" value={`${assessment.weightToGain.toFixed(1)} kg`} highlight="var(--primary-light)" />}
            <Row label="Progress to Ideal" value={`${assessment.progressPercentage?.toFixed(1)}%`} />
          </div>

          {/* Recommendations */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,214,160,0.05))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '16px', padding: '20px', marginBottom: '16px'
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: '14px', fontSize: '1rem' }}>✨ AI Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: '10px',
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)'
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(99,102,241,0.2)', color: 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700
                  }}>{i + 1}</div>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isNew && !savedMember && (
          <button
            onClick={handleSave} disabled={saving || saved}
            style={{
              width: '100%', padding: '16px',
              background: saved
                ? 'linear-gradient(135deg, #06d6a0, #0891b2)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '14px', color: '#fff',
              fontFamily: 'var(--font)', fontWeight: 700, fontSize: '1rem',
              cursor: saving || saved ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.3s ease',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? (
              <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} /> Saving...</>
            ) : (
              <><Save size={18} /> Save Member & Report</>
            )}
          </button>
        )}

        {/* ── SUCCESS PANEL after save ── */}
        {savedMember && (
          <div className="card animate-fade-up" style={{ marginTop: '24px', padding: '28px', borderColor: 'rgba(6,214,160,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(6,214,160,0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CheckCircle size={28} />
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Member Saved!</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>{savedMember.memberName} has been registered with their fitness assessment.</p>
            </div>

            {/* Quick Summary */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '22px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', flexShrink: 0 }}>
                {savedMember.memberName[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{savedMember.memberName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '2px' }}>ID: <strong style={{ color: 'var(--primary-light)' }}>{savedMember.shortId}</strong></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '3px' }}>BMI: <strong style={{ color: getBmiColor(savedMember.bmi) }}>{savedMember.bmi?.toFixed(1)} — {getBMICategory(savedMember.bmi)}</strong></div>
              </div>
              <div style={{ background: '#fff', padding: '5px', borderRadius: '8px' }}>
                <QRCode value={`${window.location.origin}/member-portal`} size={58} level="L" />
              </div>
            </div>

            {/* Action Grid */}
            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>🚀 Next Steps</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {getWhatsAppWelcomeLink(savedMember) && (
                <a href={getWhatsAppWelcomeLink(savedMember)} target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', textDecoration: 'none', background: 'rgba(37,211,102,0.05)', borderColor: '#25D366', color: '#25D366' }}
                >
                  <MessageCircle size={16} /> Send Welcome
                </a>
              )}
              <button onClick={handleMarkAttendance} disabled={attendanceCheckedIn}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: attendanceCheckedIn ? 'rgba(6,214,160,0.1)' : 'transparent', borderColor: attendanceCheckedIn ? 'var(--success)' : 'var(--border)', color: attendanceCheckedIn ? 'var(--success)' : 'var(--text)' }}
              >
                <Calendar size={16} /> {attendanceCheckedIn ? 'Checked In ✓' : 'Mark Check-in'}
              </button>
              <button onClick={() => navigate(`/workouts?memberId=${savedMember.memberId}`)}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px' }}
              >
                <Clipboard size={16} /> Assign Workout
              </button>
              <button onClick={() => setIsReceiptOpen(true)}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px' }}
              >
                <QrCode size={16} /> Print Receipt
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline flex-1" onClick={() => navigate('/add-member')}>Add Another</button>
              <button className="btn btn-primary flex-1" onClick={() => navigate('/members')}>View Members</button>
            </div>

            <ReceiptModal
              isOpen={isReceiptOpen}
              onClose={() => setIsReceiptOpen(false)}
              member={savedMember}
              gymData={gymData}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default Assessment;
