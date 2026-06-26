import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, MessageCircle, Users, Shield, Zap, LogOut, CheckCircle, Building2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { updateGymProfile, deleteAllMembers } from '../services/firestoreService';


const ToggleSwitch = ({ value, onChange }) => (
  <button
    onClick={onChange}
    style={{
      width: '48px', height: '26px', borderRadius: '999px', position: 'relative',
      background: value
        ? 'linear-gradient(135deg, #7C5CFF, #5DA9FF)'
        : 'rgba(255,255,255,0.08)',
      border: value ? 'none' : '1px solid rgba(255,255,255,0.12)',
      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', flexShrink: 0,
      boxShadow: value ? '0 0 12px rgba(124,92,255,0.4)' : 'none'
    }}
  >
    <span style={{
      position: 'absolute', top: '4px', left: value ? '25px' : '3px',
      width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
      transition: 'left 0.3s cubic-bezier(0.16,1,0.3,1)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
    }} />
  </button>
);

const SettingsSection = ({ title, icon, color = 'var(--primary-light)', children }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '20px', overflow: 'hidden',
    backdropFilter: 'blur(16px)', boxShadow: 'var(--shadow-md)',
    marginBottom: '16px'
  }}>
    <div style={{
      padding: '18px 22px', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: '10px',
      background: 'rgba(255,255,255,0.02)'
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: `${color}15`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color
      }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '15px' }}>{title}</div>
    </div>
    <div style={{ padding: '6px 22px 18px' }}>{children}</div>
  </div>
);

const ToggleRow = ({ label, desc, value, onChange, last = false }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0',
    borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.04)'
  }}>
    <div style={{ paddingRight: '12px' }}>
      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{label}</div>
      {desc && <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>{desc}</div>}
    </div>
    <ToggleSwitch value={value} onChange={onChange} />
  </div>
);

const Settings = () => {
  const { gymData, logout, refreshGymData } = useAuth();

  const navigate = useNavigate();

  const [gymName, setGymName] = useState(gymData?.gymName || '');
  const [ownerName, setOwnerName] = useState(gymData?.ownerName || '');
  const [phone, setPhone] = useState(gymData?.phone || '');
  const [address, setAddress] = useState(gymData?.address || '');
  const [logoUrl, setLogoUrl] = useState(gymData?.logoUrl || '');
  const [signatureUrl, setSignatureUrl] = useState(gymData?.signatureUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notifications, setNotifications] = useState({
    renewalAlerts: true,
    inactivityAlerts: true,
    paymentAlerts: true,
    weeklyReport: false,
  });

  const [whatsapp, setWhatsapp] = useState({
    renewalReminder: true,
    welcomeMessage: true,
    inactiveFollowUp: false,
  });

  const handleToggle = (key, stateObj, setter) => {
    setter(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGymProfile(gymData.gymId, {
        gymName,
        ownerName,
        phone,
        address,
        logoUrl,
        signatureUrl
      });
      await refreshGymData(); // Refresh context so receipt shows new data immediately
      toast.success('Settings saved successfully!');

    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const executeLogout = async () => {
    await logout();
    navigate('/login');
  };

  const executeDeleteAllMembers = async () => {
    setIsDeleting(true);
    try {
      await deleteAllMembers(gymData.gymId);
      toast.success('All member data has been cleared successfully!');
      setIsDeleteAllModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete members. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { // Limit to 500KB to prevent Firestore doc limits
        toast.error('Image is too large. Please use an image under 500KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #7C5CFF, #00D4FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(124,92,255,0.3)'
              }}>
                <SettingsIcon size={20} color="#fff" />
              </div>
              <h2 style={{ margin: 0 }}>Settings</h2>
            </div>
            <p style={{ margin: 0, color: 'var(--text-3)' }}>Manage your gym profile, notifications, and integrations</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #7C5CFF, #5DA9FF)',
              color: '#fff', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '14px',
              cursor: isSaving ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(124,92,255,0.35)',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '20px', alignItems: 'start' }}>
        {/* Left Column */}
        <div>
          <SettingsSection title="Gym Profile" icon={<Building2 size={18} />} color="#7C5CFF">
            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Gym Name</label>
              <input type="text" className="form-control" value={gymName} onChange={e => setGymName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Owner Name</label>
              <input type="text" className="form-control" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Gym Address</label>
              <textarea className="form-control" rows="2" value={address} onChange={e => setAddress(e.target.value)} placeholder="Full gym address for receipts..." />
            </div>
            
            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Gym Logo (For Receipts)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {logoUrl ? <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>No Logo</span>}
                </div>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setLogoUrl)} style={{ fontSize: '12px' }} />
                {logoUrl && <button type="button" className="btn btn-ghost" style={{ padding: '4px', color: 'var(--error)' }} onClick={() => setLogoUrl('')}><X size={16} /></button>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Authorised Signature (For Receipts)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <div style={{ width: '120px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {signatureUrl ? <img src={signatureUrl} alt="Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>No Signature</span>}
                </div>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setSignatureUrl)} style={{ fontSize: '12px' }} />
                {signatureUrl && <button type="button" className="btn btn-ghost" style={{ padding: '4px', color: 'var(--error)' }} onClick={() => setSignatureUrl('')}><X size={16} /></button>}
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Staff & Roles" icon={<Shield size={18} />} color="#5DA9FF">
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'rgba(93,169,255,0.1)', border: '1px solid rgba(93,169,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
              }}>
                <Users size={22} color="#5DA9FF" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Manage via Trainers</div>
              <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '16px', maxWidth: '240px', margin: '0 auto 16px' }}>
                Add receptionists and trainers to control access levels.
              </p>
              <button className="btn btn-outline" onClick={() => navigate('/trainers')} style={{ fontSize: '13px' }}>
                Go to Trainers
              </button>
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <div style={{
            background: 'rgba(255,94,126,0.05)', border: '1px solid rgba(255,94,126,0.2)',
            borderRadius: '16px', padding: '16px 20px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--error)', marginBottom: '12px' }}>
              Danger Zone
            </div>
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '10px',
                background: 'rgba(255,94,126,0.08)', border: '1px solid rgba(255,94,126,0.25)',
                color: 'var(--error)', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,94,126,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,94,126,0.08)'}
            >
              🗑️ Delete ALL Members (Reset App)
            </button>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                background: 'rgba(255,94,126,0.08)', border: '1px solid rgba(255,94,126,0.25)',
                color: 'var(--error)', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,94,126,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,94,126,0.08)'}
            >
              <LogOut size={17} /> Sign Out of Account
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <SettingsSection title="Notifications" icon={<Bell size={18} />} color="#FFD043">
            <ToggleRow
              label="Renewal Alerts"
              desc="Alert when memberships are expiring within 5 days"
              value={notifications.renewalAlerts}
              onChange={() => handleToggle('renewalAlerts', notifications, setNotifications)}
            />
            <ToggleRow
              label="Inactivity Alerts"
              desc="Alert when a member hasn't attended for 7 days"
              value={notifications.inactivityAlerts}
              onChange={() => handleToggle('inactivityAlerts', notifications, setNotifications)}
            />
            <ToggleRow
              label="Payment Alerts"
              desc="Alert when a member has a pending payment"
              value={notifications.paymentAlerts}
              onChange={() => handleToggle('paymentAlerts', notifications, setNotifications)}
            />
            <ToggleRow
              label="Weekly Summary"
              desc="Get a weekly performance overview"
              value={notifications.weeklyReport}
              onChange={() => handleToggle('weeklyReport', notifications, setNotifications)}
              last
            />
          </SettingsSection>

          <SettingsSection title="WhatsApp Integration" icon={<MessageCircle size={18} />} color="#25D366">
            <div style={{
              margin: '12px 0 4px', padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)',
              fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.6
            }}>
              📲 Messages use pre-filled wa.me links — no API key required. Tap to open WhatsApp directly.
            </div>
            <ToggleRow
              label="Renewal Reminders"
              desc="One-click WhatsApp reminders in Renewals"
              value={whatsapp.renewalReminder}
              onChange={() => handleToggle('renewalReminder', whatsapp, setWhatsapp)}
            />
            <ToggleRow
              label="Welcome Messages"
              desc="Send a welcome WhatsApp to new members"
              value={whatsapp.welcomeMessage}
              onChange={() => handleToggle('welcomeMessage', whatsapp, setWhatsapp)}
            />
            <ToggleRow
              label="Inactive Follow-ups"
              desc="Suggest follow-up for inactive members"
              value={whatsapp.inactiveFollowUp}
              onChange={() => handleToggle('inactiveFollowUp', whatsapp, setWhatsapp)}
              last
            />
          </SettingsSection>

          {/* Plan badge */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,92,255,0.1), rgba(0,212,255,0.08))',
            border: '1px solid rgba(124,92,255,0.2)',
            borderRadius: '16px', padding: '20px 22px',
            display: 'flex', alignItems: 'center', gap: '14px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #7C5CFF, #00D4FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(124,92,255,0.35)', flexShrink: 0
            }}>
              <Zap size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--primary-light)' }}>Prana AI Pro</div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>All features unlocked • No limits on members</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        isDestructive={true}
        onConfirm={executeLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isDeleteAllModalOpen}
        title="⚠️ Delete ALL Members?"
        message={`This will permanently delete every single member from your gym database. This action CANNOT be undone. Are you absolutely sure?`}
        confirmText={isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
        isDestructive={true}
        onConfirm={executeDeleteAllMembers}
        onCancel={() => setIsDeleteAllModalOpen(false)}
      />
    </div>
  );
};

export default Settings;
