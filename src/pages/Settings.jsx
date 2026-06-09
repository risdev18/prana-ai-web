import React, { useState, useEffect } from 'react';
import { MapPin, Shield, Bell, Palette, Camera, Save, X, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getGymLocation, updateGymLocation } from '../services/firestoreService';
import QRCode from 'react-qr-code';

const Settings = () => {
  const { currentUser, gymData } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // profile, location, qr, staff, notifications

  // Location State
  const [gymLat, setGymLat] = useState('');
  const [gymLng, setGymLng] = useState('');
  const [allowedRadius, setAllowedRadius] = useState(100);
  const [locationStatus, setLocationStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser && activeTab === 'location') {
      getGymLocation(currentUser.uid).then(loc => {
        if (loc) {
          setGymLat(String(loc.gymLat));
          setGymLng(String(loc.gymLng));
          setAllowedRadius(loc.allowedRadius || 100);
        }
      });
    }
  }, [currentUser, activeTab]);

  const handleSaveLocation = async () => {
    setIsSaving(true);
    setLocationStatus('');
    try {
      await updateGymLocation(currentUser.uid, {
        gymLat: parseFloat(gymLat),
        gymLng: parseFloat(gymLng),
        allowedRadius: parseFloat(allowedRadius)
      });
      setLocationStatus('Location saved successfully!');
    } catch (err) {
      setLocationStatus('Error saving location.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Gym Profile', icon: Camera },
    { id: 'location', label: 'Location setup', icon: MapPin },
    { id: 'qr', label: 'QR Setup', icon: QrCode },
    { id: 'staff', label: 'Staff Roles', icon: Shield },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-head)', lineHeight: 1.2 }}>Settings</h1>
        <p style={{ color: 'var(--text-2)' }}>Manage your gym's configuration and preferences.</p>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Sidebar Nav */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none', color: activeTab === tab.id ? '#fff' : 'var(--text-2)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                textAlign: 'left', transition: 'all 0.2s ease'
              }}
            >
              <tab.icon size={18} color={activeTab === tab.id ? 'var(--primary-light)' : 'var(--text-3)'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', minHeight: '400px' }}>
          
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Gym Profile</h2>
              <div style={{ display: 'flex', gap: '32px' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', cursor: 'pointer', border: '1px dashed var(--border)' }}>
                  <Camera size={32} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '8px' }}>Gym Name</label>
                    <input type="text" className="form-control" defaultValue={gymData?.gymName} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '8px' }}>Owner Name</label>
                    <input type="text" className="form-control" defaultValue={gymData?.ownerName} />
                  </div>
                  <button className="btn btn-primary" style={{ width: 'fit-content', marginTop: '16px' }}>Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>GPS Location Setup</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Configure the gym's coordinates to prevent fake check-ins. Members can only mark attendance within the allowed radius.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '8px' }}>Latitude</label>
                  <input type="text" className="form-control" value={gymLat} onChange={e => setGymLat(e.target.value)} placeholder="e.g. 18.5204" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '8px' }}>Longitude</label>
                  <input type="text" className="form-control" value={gymLng} onChange={e => setGymLng(e.target.value)} placeholder="e.g. 73.8567" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '8px' }}>Allowed Radius (meters)</label>
                  <input type="number" className="form-control" value={allowedRadius} onChange={e => setAllowedRadius(e.target.value)} placeholder="100" />
                </div>
                
                {locationStatus && <div style={{ color: locationStatus.includes('Error') ? 'var(--error)' : 'var(--success)', fontSize: '0.85rem' }}>{locationStatus}</div>}

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={handleSaveLocation} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Location'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Gym Check-In QR Code</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '32px' }}>
                Print this QR code and paste it at your gym's entrance.
              </p>
              
              <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', display: 'inline-block', marginBottom: '24px' }}>
                <QRCode value={currentUser?.uid || ''} size={256} />
              </div>
              
              <div>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => window.print()}>
                  Print QR Code
                </button>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Staff & Roles</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Invite staff members and configure their permissions.
              </p>
              <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--text-3)' }}>
                Staff management module coming soon in phase 2.
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Notification Alerts</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Configure which alerts you want to receive.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                  <span>Membership Expiry Alerts (7 days before)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                  <span>New Member Joined Alerts</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                  <span>Daily Revenue Summary</span>
                </label>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Settings;
