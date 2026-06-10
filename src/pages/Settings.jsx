import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, MessageCircle, Users, Shield, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsSection = ({ title, icon, children }) => (
  <div className="card mb-4">
    <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ color: 'var(--primary)' }}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: '16px' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const ToggleRow = ({ label, desc, value, onChange }) => (
  <div className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
    <div>
      <div style={{ fontWeight: 500, fontSize: '14px' }}>{label}</div>
      {desc && <div className="text-muted text-sm">{desc}</div>}
    </div>
    <button
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '999px', position: 'relative',
        background: value ? 'var(--primary)' : 'rgba(255,255,255,0.1)', border: 'none',
        cursor: 'pointer', transition: 'background 0.2s ease', flexShrink: 0
      }}
    >
      <span style={{
        position: 'absolute', top: '3px', left: value ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s ease'
      }} />
    </button>
  </div>
);

const Settings = () => {
  const { gymData, logout } = useAuth();
  const navigate = useNavigate();
  
  const [gymName, setGymName] = useState(gymData?.gymName || '');
  const [ownerName, setOwnerName] = useState(gymData?.ownerName || '');
  const [phone, setPhone] = useState(gymData?.phone || '');
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    // Simulate save with a brief state change
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Settings</h2>
          <p className="text-muted">Manage your gym profile, notifications, and integrations.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? '✓ Saved!' : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <div className="grid-2 gap-4">
        <div>
          <SettingsSection title="Gym Profile" icon={<Zap size={20} />}>
            <div className="form-group">
              <label>Gym Name</label>
              <input type="text" className="form-control" value={gymName} onChange={e => setGymName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Owner Name</label>
              <input type="text" className="form-control" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
            </div>
            <div className="form-group mb-0">
              <label>Contact Phone</label>
              <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </SettingsSection>

          <SettingsSection title="Staff & Roles" icon={<Shield size={20} />}>
            <div className="empty-state" style={{ border: 'none', padding: '16px 0' }}>
              <Users size={32} />
              <h4 className="mt-3">Manage via Trainers</h4>
              <p className="text-sm">Add receptionists and trainers in the Trainers module to control access levels.</p>
              <button className="btn btn-outline mt-3" onClick={() => navigate('/trainers')}>
                Go to Trainers
              </button>
            </div>
          </SettingsSection>

          <div className="card">
            <button 
              className="btn w-full" 
              style={{ background: 'var(--error-bg)', color: 'var(--error)', justifyContent: 'center', gap: '8px' }}
              onClick={handleLogout}
            >
              <LogOut size={18} /> Sign Out of Account
            </button>
          </div>
        </div>

        <div>
          <SettingsSection title="Notifications" icon={<Bell size={20} />}>
            <ToggleRow
              label="Renewal Alerts"
              desc="Alert when memberships are expiring within 5 days"
              value={notifications.renewalAlerts}
              onChange={() => handleToggle('renewalAlerts', notifications, setNotifications)}
            />
            <ToggleRow
              label="Inactivity Alerts"
              desc="Alert when a member has not attended for 7 days"
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
              desc="Get a weekly overview of gym performance"
              value={notifications.weeklyReport}
              onChange={() => handleToggle('weeklyReport', notifications, setNotifications)}
            />
          </SettingsSection>

          <SettingsSection title="WhatsApp Integration" icon={<MessageCircle size={20} />}>
            <div className="mb-4 p-3 rounded" style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '10px', fontSize: '13px', color: 'var(--text-2)' }}>
              Messages are sent as pre-filled WhatsApp links (wa.me). No API key needed.
            </div>
            <ToggleRow
              label="Renewal Reminders"
              desc="Activate one-click WhatsApp reminders in Renewals"
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
              desc="Suggest WhatsApp follow-up for inactive members"
              value={whatsapp.inactiveFollowUp}
              onChange={() => handleToggle('inactiveFollowUp', whatsapp, setWhatsapp)}
            />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
};

export default Settings;
