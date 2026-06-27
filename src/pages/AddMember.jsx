import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, CheckCircle, QrCode, Ruler, Weight, Target, Activity, DollarSign, Camera, Sparkles, Calendar, MessageCircle, Clipboard } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { addMember, markAttendance } from '../services/firestoreService';
import { GENDERS, ACTIVITY_LEVELS, GOALS } from '../core/constants';
import { generateAssessment } from '../core/calculator';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import ReceiptModal from '../components/ReceiptModal';

const GOAL_ICONS = {
  'Cut': '🔥',
  'Bulk': '💪',
  'Maintain': '⚡',
};

const ACTIVITY_DESC = {
  'Sedentary': 'Little or no exercise',
  'Lightly Active': 'Light exercise 1-3 days/week',
  'Moderately Active': 'Moderate exercise 3-5 days/week',
  'Very Active': 'Hard exercise 6-7 days/week',
};

const AddMember = () => {
  const navigate = useNavigate();
  const { gymData, currentUser } = useAuth();
  
  // Default dates
  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    memberName: '',
    phone: '',
    membershipStartDate: todayStr,
    membershipEndDate: nextMonthStr,
    paymentStatus: 'Paid',
    membershipFee: 1500,
    amountPaid: 1500,
    photoUrl: '', // Base64 picture
    // Fitness metrics (optional)
    includeFitness: false,
    age: '',
    gender: GENDERS.MALE,
    height: '',
    weight: '',
    activityLevel: ACTIVITY_LEVELS.MODERATELY_ACTIVE,
    goal: GOALS.MAINTAIN,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMember, setSuccessMember] = useState(null);
  const [attendanceCheckedIn, setAttendanceCheckedIn] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    // Automatically set amount paid to fee if paymentStatus is Paid
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      if (name === 'membershipFee' && prev.paymentStatus === 'Paid') {
        next.amountPaid = val;
      }
      if (name === 'paymentStatus') {
        if (value === 'Paid') {
          next.amountPaid = next.membershipFee;
        } else {
          next.amountPaid = 0;
        }
      }
      return next;
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.memberName.trim()) return toast.error('Name is required');
    if (!formData.phone.trim()) return toast.error('Phone number is required');

    const fee = parseFloat(formData.membershipFee);
    const paid = parseFloat(formData.amountPaid);
    if (isNaN(fee) || fee < 0) return toast.error('Invalid membership fee');
    if (isNaN(paid) || paid < 0 || paid > fee) return toast.error('Amount paid must be between 0 and the total fee');

    setLoading(true);

    try {
      const gymName = gymData?.gymName || 'GYM';
      const prefix = gymName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);
      const shortId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

      let newMember = {
        memberId: uuidv4(),
        shortId,
        memberName: formData.memberName.trim(),
        phone: formData.phone.trim(),
        membershipStartDate: formData.membershipStartDate,
        membershipEndDate: formData.membershipEndDate,
        durationMonths: Math.round((new Date(formData.membershipEndDate) - new Date(formData.membershipStartDate)) / (1000 * 60 * 60 * 24 * 30)),
        paymentStatus: formData.paymentStatus,
        membershipFee: fee,
        amountPaid: paid,
        photoUrl: formData.photoUrl || '',
        createdAt: new Date().toISOString(),
      };

      if (formData.includeFitness) {
        const age = parseInt(formData.age);
        const height = parseFloat(formData.height);
        const weight = parseFloat(formData.weight);

        if (isNaN(age) || age <= 0 || age > 120) throw new Error('Enter a valid age (1–120)');
        if (isNaN(height) || height <= 0 || height > 300) throw new Error('Enter a valid height (1–300 cm)');
        if (isNaN(weight) || weight <= 0 || weight > 500) throw new Error('Enter a valid weight (1–500 kg)');

        newMember = {
          ...newMember,
          age,
          gender: formData.gender,
          height,
          weight,
          startingWeight: weight,
          activityLevel: formData.activityLevel,
          goal: formData.goal,
        };

        const assessmentResult = generateAssessment(newMember);
        // Navigate to the assessment page, letting it save from there
        setLoading(false);
        navigate('/assessment', { state: { assessment: assessmentResult, isNew: true } });
        return;
      }

      // Save directly if no fitness toggled
      await addMember(currentUser.uid, newMember);
      setSuccessMember(newMember);
      toast.success('Member added successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!successMember) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await markAttendance(currentUser.uid, todayStr, successMember.memberId, successMember.memberName);
      setAttendanceCheckedIn(true);
      toast.success('Checked in today!');
    } catch (err) {
      toast.error('Failed to mark check-in.');
    }
  };

  const getWhatsAppWelcomeLink = (member) => {
    const phone = member.phone.replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const gymName = gymData?.gymName || 'our gym';
    const startDateStr = member.membershipStartDate ? new Date(member.membershipStartDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
    
    const text = `🏋️‍♂️ Welcome to ${gymName}, ${member.memberName}!\n\n` +
      `Your membership has been successfully activated.\n\n` +
      `🆔 Member ID: ${member.shortId}\n` +
      `📅 Joining Date: ${startDateStr}\n\n` +
      `We're excited to be a part of your fitness journey and help you achieve your goals. Stay consistent, train hard, and remember—every workout brings you one step closer to your best self!\n\n` +
      `If you need any assistance, feel free to contact our team.\n\n` +
      `Welcome to the ${gymName} family! 💪🔥\n\n` +
      `Team ${gymName}`;
      
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  if (successMember) {
    const balance = successMember.membershipFee - successMember.amountPaid;
    return (
      <div className="page" style={{ paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>
        <div className="card animate-fade-up" style={{ width: '100%', maxWidth: '540px', padding: '32px' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} />
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Member Added successfully!</h2>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>{successMember.memberName} has been registered.</p>
          </div>

          {/* Quick Summary card */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '28px' }}>
            {successMember.photoUrl ? (
              <img src={successMember.photoUrl} alt={successMember.memberName} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
            ) : (
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem' }}>
                {successMember.memberName[0].toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{successMember.memberName}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: '2px' }}>ID: <strong style={{ color: 'var(--primary-light)' }}>{successMember.shortId}</strong></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginTop: '4px' }}>
                Dues: {balance > 0 ? <span style={{ color: 'var(--error)', fontWeight: 600 }}>₹{balance} Pending</span> : <span style={{ color: 'var(--success)', fontWeight: 600 }}>Fully Paid</span>}
              </div>
            </div>
            <div style={{ background: '#fff', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QRCode value={`${window.location.origin}/member-portal`} size={64} level="L" />
            </div>
          </div>

          {/* ACTION CHAINING - Flow Connectivity */}
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            🚀 Next Steps & Actions
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
            <a 
              href={getWhatsAppWelcomeLink(successMember)}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', textDecoration: 'none', background: 'rgba(37, 211, 102, 0.05)', borderColor: '#25D366', color: '#25D366' }}
            >
              <MessageCircle size={18} /> Send Welcome
            </a>
            
            <button 
              onClick={handleMarkAttendance}
              disabled={attendanceCheckedIn}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: attendanceCheckedIn ? 'rgba(6, 214, 160, 0.1)' : 'transparent', borderColor: attendanceCheckedIn ? 'var(--success)' : 'var(--border)', color: attendanceCheckedIn ? 'var(--success)' : 'var(--text)' }}
            >
              <Calendar size={18} /> {attendanceCheckedIn ? 'Checked In ✓' : 'Mark Check-in'}
            </button>
            
            <button 
              onClick={() => navigate(`/workouts?memberId=${successMember.memberId}`)}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}
            >
              <Clipboard size={18} /> Assign Workout
            </button>
            
            <button 
              onClick={() => navigate(`/assessment?memberId=${successMember.memberId}&goal=${successMember.goal}`)}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}
            >
              <Sparkles size={18} /> AI Onboarding
            </button>

            <button 
              onClick={() => setIsReceiptOpen(true)}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: 'var(--primary-light)', color: '#fff', border: 'none', gridColumn: 'span 2' }}
            >
              <Clipboard size={18} /> View & Share Receipt
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline flex-1" onClick={() => { setSuccessMember(null); setAttendanceCheckedIn(false); setFormData(prev => ({ ...prev, memberName: '', phone: '', photoUrl: '' })); setIsReceiptOpen(false); }}>
              Add Another Member
            </button>
            <button className="btn btn-primary flex-1" onClick={() => navigate('/members')}>
              View Members List
            </button>
          </div>

          <ReceiptModal 
            isOpen={isReceiptOpen} 
            onClose={() => setIsReceiptOpen(false)} 
            member={successMember} 
            gymData={gymData} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        
        {/* Title bar */}
        <div className="flex items-center gap-3 mb-6">
          <button className="btn btn-ghost" style={{ padding: '8px', width: 'auto' }} onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Add Gym Member</h2>
            <p className="text-muted" style={{ fontSize: '13px' }}>Create profiles, record billing dues, and run AI reports.</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          {/* TAB 1: Billing & Basic Info */}
          <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px', color: 'var(--primary-light)' }}>
              👤 Basic Info & Billing
            </h3>

            {/* Profile image upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={20} color="var(--text-3)" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                  title="Upload Face Photo"
                />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Set Face Profile</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>Upload member profile picture</div>
              </div>
            </div>

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
                  placeholder="10-digit phone number" style={{ paddingLeft: '38px' }}
                  value={formData.phone} onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid-2 gap-3">
              <div className="form-group mb-0">
                <label>Start Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="date" name="membershipStartDate" className="form-control"
                    style={{ paddingLeft: '38px' }}
                    value={formData.membershipStartDate} onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group mb-0">
                <label>End Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="date" name="membershipEndDate" className="form-control"
                    style={{ paddingLeft: '38px' }}
                    value={formData.membershipEndDate} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Payment Status</label>
              <select name="paymentStatus" className="form-control" value={formData.paymentStatus} onChange={handleChange}>
                <option value="Paid">Fully Paid</option>
                <option value="Pending">Pending / Balance Due</option>
              </select>
            </div>

            <div className="grid-2 gap-3" style={{ marginTop: '14px' }}>
              <div className="form-group mb-0">
                <label>Total Membership Fee (₹)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="number" name="membershipFee" className="form-control" style={{ paddingLeft: '30px' }}
                    value={formData.membershipFee} onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group mb-0">
                <label>Amount Paid (₹)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="number" name="amountPaid" className="form-control" style={{ paddingLeft: '30px' }}
                    disabled={formData.paymentStatus === 'Paid'}
                    value={formData.amountPaid} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {formData.membershipFee - formData.amountPaid > 0 && (
              <div style={{ marginTop: '14px', fontSize: '13px', color: 'var(--error)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                ⚠️ Balance dues of ₹{formData.membershipFee - formData.amountPaid} will be tracked.
              </div>
            )}
          </div>

          {/* TAB 2: OPTIONAL Fitness Assessment */}
          <div className="card" style={{ marginBottom: '28px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                ⚡ Fitness & AI Onboarding (Optional)
              </h3>
              <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox" name="includeFitness"
                  checked={formData.includeFitness} onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Enable</span>
              </label>
            </div>

            {formData.includeFitness && (
              <div style={{ marginTop: '20px', animation: 'fadeIn 0.25s ease-out' }}>
                <div className="grid-2 gap-3" style={{ marginBottom: '14px' }}>
                  <div className="form-group mb-0">
                    <label>Age *</label>
                    <input
                      type="number" name="age" className="form-control" required
                      placeholder="25" min="1" max="120"
                      value={formData.age} onChange={handleChange}
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label>Gender *</label>
                    <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                      {Object.values(GENDERS).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-2 gap-3" style={{ marginBottom: '14px' }}>
                  <div className="form-group mb-0">
                    <label>Height (cm) *</label>
                    <div style={{ position: 'relative' }}>
                      <Ruler size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                      <input
                        type="number" name="height" className="form-control" required
                        placeholder="170" min="100" max="250" style={{ paddingLeft: '34px' }}
                        value={formData.height} onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="form-group mb-0">
                    <label>Weight (kg) *</label>
                    <div style={{ position: 'relative' }}>
                      <Weight size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                      <input
                        type="number" name="weight" className="form-control" required
                        placeholder="70" min="30" max="250" style={{ paddingLeft: '34px' }}
                        value={formData.weight} onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Activity Level</label>
                  <select name="activityLevel" className="form-control" value={formData.activityLevel} onChange={handleChange}>
                    {Object.values(ACTIVITY_LEVELS).map(a => (
                      <option key={a} value={a}>{a} — {ACTIVITY_DESC[a] || ''}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-0">
                  <label>Fitness Goal</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {Object.values(GOALS).map(g => (
                      <button
                        type="button" key={g}
                        onClick={() => setFormData(prev => ({ ...prev, goal: g }))}
                        style={{
                          flex: 1, minWidth: '90px',
                          padding: '12px 10px', borderRadius: '10px',
                          border: formData.goal === g ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: formData.goal === g ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          color: formData.goal === g ? 'var(--primary-light)' : 'var(--text-2)',
                          fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{GOAL_ICONS[g] || '🏋️'}</span>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2" disabled={loading} style={{ padding: '16px', fontSize: '16px', fontWeight: 700 }}>
            {loading ? 'Processing...' : formData.includeFitness ? <><Sparkles size={20} /> Generate Assessment & Plan</> : <><QrCode size={20} /> Save & Generate QR</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMember;
