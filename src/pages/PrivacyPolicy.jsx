import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '36px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px', borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
        {title}
      </h3>
      <div style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px 80px', maxWidth: '760px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', marginBottom: '32px', fontSize: '14px' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #7C5CFF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={22} color="#fff" />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Privacy Policy</h1>
      </div>
      <p style={{ color: 'var(--text-3)', fontSize: '13px', marginBottom: '40px' }}>
        Last updated: June 2026 &nbsp;|&nbsp; Vyronix Gym Management
      </p>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', backdropFilter: 'blur(16px)' }}>

        <Section title="1. Information We Collect">
          We collect information that gym owners and staff provide when registering, including gym name, owner name, contact phone number, and email address. We also collect member data entered by gym staff such as names, phone numbers, membership dates, and payment records. We do not collect financial card or UPI credentials.
        </Section>

        <Section title="2. How We Use Your Data">
          <ul style={{ paddingLeft: '20px', listStyle: 'disc' }}>
            <li>To operate the gym management dashboard and provide core features.</li>
            <li>To generate PDF invoices and attendance records for your gym.</li>
            <li>To allow gym owners to send WhatsApp reminders via pre-filled wa.me links (no messages are sent automatically by us).</li>
            <li>To sync backup data to a Google Sheet connected by the gym owner.</li>
          </ul>
        </Section>

        <Section title="3. Data Storage & Security">
          All data is stored securely in Google Firebase Firestore. Each gym's data is isolated by their unique authenticated user ID. We use Firebase Authentication to ensure only authorized gym owners and staff can access your gym's data. Firestore Security Rules prevent unauthorized reads or writes.
        </Section>

        <Section title="4. Data Sharing">
          We do not sell, rent, or share your data with any third parties. The only external service used is Google Firebase (for authentication and database) and Google Sheets (optional, only if you connect it yourself). WhatsApp messages are sent directly from your device — we never have access to them.
        </Section>

        <Section title="5. Member Data Rights">
          Gym members whose data is entered by the gym owner can request deletion of their data by contacting the gym owner directly. Gym owners can delete individual member profiles at any time from within the app.
        </Section>

        <Section title="6. Data Retention">
          Your gym data is retained for as long as your account is active. You can delete all member data at any time using the "Delete ALL Members" option in Settings. If you wish to fully delete your gym account, please contact us.
        </Section>

        <Section title="7. Cookies">
          We use only essential browser storage (localStorage and Firebase session cookies) to keep you logged in. We do not use tracking or advertising cookies.
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify gym owners of significant changes via the app. Continued use of the app after changes constitutes acceptance.
        </Section>

        <Section title="9. Contact Us">
          If you have any questions about this Privacy Policy, please contact us at:
          <br /><br />
          <strong style={{ color: '#fff' }}>Vyronix Support</strong><br />
          For issues, contact your account administrator or reach out through the app's support channel.
        </Section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
