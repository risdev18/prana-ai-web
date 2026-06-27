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
    </div>
  );
};

export default AppSupport;
