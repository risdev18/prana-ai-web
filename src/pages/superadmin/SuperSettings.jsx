import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperSettings = () => {
  const [settings, setSettings] = useState({
    websiteName: '',
    supportEmail: '',
    supportPhone: '',
    supportIdImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'GlobalSettings', 'appSettings'));
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'GlobalSettings', 'appSettings'), settings, { merge: true });
      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><div style={{ color: '#fff' }}>Loading settings...</div></div>;

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings color="var(--primary)" /> Global Settings
          </h2>
          <p style={{ margin: 0, color: 'var(--text-3)' }}>Update app-wide configurations</p>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '32px', maxWidth: '600px'
      }}>
        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Website / App Name</label>
            <input 
              type="text" 
              className="input" 
              value={settings.websiteName || ''} 
              onChange={e => setSettings({...settings, websiteName: e.target.value})} 
              placeholder="e.g. Vyronix"
              required 
            />
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '6px' }}>This name will be displayed in the support section for all gyms.</p>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Support Email Address</label>
            <input 
              type="email" 
              className="input" 
              value={settings.supportEmail || ''} 
              onChange={e => setSettings({...settings, supportEmail: e.target.value})} 
              placeholder="support@example.com"
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Support Phone Number</label>
            <input 
              type="text" 
              className="input" 
              value={settings.supportPhone || ''} 
              onChange={e => setSettings({...settings, supportPhone: e.target.value})} 
              placeholder="+1 234 567 8900" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label>Admin ID / Image URL</label>
            <input 
              type="text" 
              className="input" 
              value={settings.supportIdImage || ''} 
              onChange={e => setSettings({...settings, supportIdImage: e.target.value})} 
              placeholder="https://example.com/my-id.jpg" 
            />
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '6px' }}>Provide a direct link to an image (optional).</p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperSettings;
