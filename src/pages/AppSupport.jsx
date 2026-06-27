import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Phone, Image as ImageIcon, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AppSupport = () => {
  const { currentUser, gymData } = useAuth();
  const [settings, setSettings] = useState(null);
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'GlobalSettings', 'appSettings'));
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching support settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSupportTicket = async (e) => {
    e.preventDefault();
    if (!subject || !message) return;
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'GlobalTickets'), {
        gymId: currentUser.uid,
        gymName: gymData?.gymName || 'Unknown Gym',
        subject,
        message,
        status: 'Open',
        createdAt: serverTimestamp(),
      });
      toast.success('Your message has been sent to the Admin.');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settings) return <div className="page"><div style={{ color: '#fff' }}>Loading support info...</div></div>;

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield color="var(--primary)" /> 
          {settings.websiteName} Support
        </h2>
        <p style={{ margin: 0, color: 'var(--text-3)' }}>Contact the application administrator</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Contact Information</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Mail color="var(--text-2)" size={20} />
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Email Address</div>
                <div style={{ color: '#fff' }}>{settings.supportEmail || 'Not Provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Phone color="var(--text-2)" size={20} />
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Phone Number</div>
                <div style={{ color: '#fff' }}>{settings.supportPhone || 'Not Provided'}</div>
              </div>
            </div>

            {settings.supportIdImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ImageIcon color="var(--text-2)" size={20} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Admin ID / Verification</div>
                  <a href={settings.supportIdImage} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>View Image</a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: '2 1 400px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} color="var(--primary)" />
              Send a Complaint / Inquiry
            </h3>
            <form onSubmit={handleSupportTicket}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Subject</label>
                <input type="text" className="input" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="e.g., Billing Issue, Feature Request" />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Message</label>
                <textarea className="input" value={message} onChange={e => setMessage(e.target.value)} required rows="5" placeholder="Describe your issue or inquiry in detail..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Send size={18} /> {isSubmitting ? 'Sending...' : 'Send to Admin'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Gym Owner's Own Configured Support Channels */}
      {(gymData?.supportPhone || gymData?.supportWebsite || gymData?.supportEmail) && (
        <div style={{ marginTop: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🎯 Gym Support Shortcuts
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-3)', fontSize: '13px' }}>Quick links to launch your configured customer support channels</p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {gymData.supportPhone && (
              <a 
                href={`https://wa.me/${gymData.supportPhone.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  flex: '1 1 200px',
                  background: 'linear-gradient(135deg, rgba(37,211,102,0.15) 0%, rgba(37,211,102,0.05) 100%)',
                  border: '1px solid rgba(37,211,102,0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 4px 20px rgba(37,211,102,0.05)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.05)';
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(37,211,102,0.8)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp Support</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{gymData.supportPhone}</div>
                </div>
              </a>
            )}

            {gymData.supportWebsite && (
              <a 
                href={gymData.supportWebsite} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  flex: '1 1 200px',
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.05) 100%)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 4px 20px rgba(0,212,255,0.05)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,212,255,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,212,255,0.05)';
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#00D4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(0,212,255,0.8)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gym Website</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{gymData.supportWebsite.replace(/^https?:\/\/(www\.)?/, '')}</div>
                </div>
              </a>
            )}

            {gymData.supportEmail && (
              <a 
                href={`mailto:${gymData.supportEmail}`}
                style={{
                  flex: '1 1 200px',
                  background: 'linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(124,92,255,0.05) 100%)',
                  border: '1px solid rgba(124,92,255,0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 4px 20px rgba(124,92,255,0.05)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,92,255,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,92,255,0.05)';
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#7C5CFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(124,92,255,0.8)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Support</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{gymData.supportEmail}</div>
                </div>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppSupport;
