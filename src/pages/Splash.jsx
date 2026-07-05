import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, CalendarCheck, RefreshCw, MessageCircle, UserPlus, Zap, TrendingUp, CheckCircle, Smartphone } from 'lucide-react';

const MockStatCard = ({ title, value, icon, color }) => (
  <div style={{
    background: 'rgba(15,12,38,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', padding: '16px', backdropFilter: 'blur(16px)',
    display: 'flex', alignItems: 'center', gap: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }}
  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${color}50`; }}
  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
  >
    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{value}</div>
    </div>
  </div>
);

const Splash = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  if (currentUser) return null;

  const features = [
    {
      icon: <Users size={22} color="#6366f1" />,
      title: 'Member Management',
      desc: 'Add members in under 10 seconds. Auto-generate QR codes. Track status, expiry, and payment instantly.'
    },
    {
      icon: <RefreshCw size={22} color="#f59e0b" />,
      title: 'Renewal Center',
      desc: 'Never miss a renewal. See every expiring and expired member in one queue with one-click WhatsApp reminders.'
    },
    {
      icon: <CalendarCheck size={22} color="#10b981" />,
      title: 'Attendance Tracking',
      desc: 'QR-based check-in. Manual marking. Daily heatmap showing your gym\'s activity at a glance.'
    },
    {
      icon: <MessageCircle size={22} color="#25D366" />,
      title: 'WhatsApp Integration',
      desc: 'Send renewal reminders, payment follow-ups, and welcome messages — no API key needed. Pure wa.me links.'
    },
    {
      icon: <UserPlus size={22} color="#06b6d4" />,
      title: 'Lead Management',
      desc: 'Track inquiries and trial members. Move leads from inquiry to converted with a simple pipeline.'
    },
    {
      icon: <Shield size={22} color="#8b5cf6" />,
      title: 'Member Portal',
      desc: 'Members access their own profile, workout plan, BMI progress, and QR entry pass from any device.'
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Premium Navbar */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        position: 'sticky', top: 0, background: 'rgba(7,5,20,0.5)', zIndex: 100,
        backdropFilter: 'blur(24px) saturate(150%)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.05em', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7C5CFF, #00D4FF)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124,92,255,0.4)' }}>
            <Zap size={16} color="#fff" />
          </div>
          VYRONIX
        </div>
        <div className="splash-nav-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => navigate('/member-portal')} className="btn splash-member-portal-btn" style={{ fontSize: '12px', padding: '6px 12px', height: '36px', gap: '5px', background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.35)', color: 'var(--primary-light)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font)', display: 'flex', alignItems: 'center' }}><Smartphone size={13} /> Member Portal</button>
          <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 14px', height: '36px', background: 'rgba(255,255,255,0.03)' }}>Gym Login</button>
          <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 16px', height: '36px' }}>Start Free</button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden' }}>

        {/* Hero Section */}
        <section style={{
          padding: '80px 24px 60px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          position: 'relative', width: '100%', maxWidth: '1200px'
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '999px',
            background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.2)',
            color: 'var(--primary-light)', fontSize: '11px', fontWeight: 800,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '28px',
            boxShadow: '0 0 20px rgba(124,92,255,0.1)',
            animation: 'fadeUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both'
          }}>
            <Zap size={14} /> AI-Powered Gym SaaS
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4.2vw, 3.8rem)',
            fontWeight: 800, lineHeight: 0.95,
            letterSpacing: '-0.03em', marginBottom: '24px',
            maxWidth: '900px', color: 'var(--text)',
            textShadow: '0 10px 40px rgba(0,0,0,0.5)',
            animation: 'fadeUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both'
          }}>
            Manage Members, Payments & Operations in One Smart Platform.
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', color: 'var(--text-2)',
            maxWidth: '600px', lineHeight: 1.6, marginBottom: '40px',
            animation: 'fadeUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both'
          }}>
            Built for modern fitness businesses. Automate renewals, track attendance visually, and scale your gym without messy spreadsheets.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px', animation: 'fadeUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both' }}>
            <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '15px', height: '52px' }}>
              Create Your Free Account
            </button>
            <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ padding: '16px 36px', fontSize: '15px', height: '52px', background: 'rgba(255,255,255,0.02)' }}>
              See Live Demo
            </button>
          </div>

          {/* Trust Signals */}
          <div style={{
            display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center',
            color: 'var(--text-3)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em',
            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px',
            animation: 'fadeUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary)" /> 10,000+ Members Managed</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--accent)" /> 500+ Gyms Active</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--success)" /> 98% Renewal Accuracy</div>
          </div>
        </section>

        {/* Dashboard Preview Section (The "SaaS App" Feel) */}
        <section style={{ width: '100%', maxWidth: '1100px', padding: '0 24px 100px', position: 'relative', animation: 'fadeUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both' }}>
          
          <div style={{
            background: 'rgba(11,16,32,0.7)', border: '1px solid rgba(124,92,255,0.2)',
            borderRadius: '24px', padding: '12px',
            backdropFilter: 'blur(30px) saturate(150%)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(124,92,255,0.1)',
            position: 'relative'
          }}>
            {/* Window controls */}
            <div style={{ display: 'flex', gap: '8px', padding: '8px 12px 16px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5E7E', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFA000', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#00E676', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)' }} />
            </div>

            {/* Inner Dashboard Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', minHeight: '540px', background: '#070514', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              
              {/* Mock Sidebar */}
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', padding: '0 8px' }}>
                  <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #7C5CFF, #00D4FF)', borderRadius: 8 }} />
                  <div style={{ height: 12, width: 80, background: 'rgba(255,255,255,0.8)', borderRadius: 4 }} />
                </div>
                <div style={{ width: '100%', height: '36px', background: 'rgba(124,92,255,0.15)', borderRadius: '10px', borderLeft: '3px solid var(--primary)', display: 'flex', alignItems: 'center', paddingLeft: '12px', gap: '12px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--primary)' }} />
                  <div style={{ height: 10, width: 60, background: 'var(--primary-light)', borderRadius: 4 }} />
                </div>
                <div style={{ width: '100%', height: '36px', background: 'transparent', borderRadius: '10px', display: 'flex', alignItems: 'center', paddingLeft: '14px', gap: '12px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(255,255,255,0.2)' }} />
                  <div style={{ height: 10, width: 70, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
                </div>
                <div style={{ width: '100%', height: '36px', background: 'transparent', borderRadius: '10px', display: 'flex', alignItems: 'center', paddingLeft: '14px', gap: '12px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(255,255,255,0.2)' }} />
                  <div style={{ height: 10, width: 50, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
                </div>
                <div style={{ width: '100%', height: '36px', background: 'transparent', borderRadius: '10px', display: 'flex', alignItems: 'center', paddingLeft: '14px', gap: '12px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(255,255,255,0.2)' }} />
                  <div style={{ height: 10, width: 80, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
                </div>
              </div>

              {/* Mock Content area */}
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ height: 24, width: 150, background: 'rgba(255,255,255,0.8)', borderRadius: 6 }} />
                  <div style={{ height: 36, width: 120, background: 'linear-gradient(135deg, #7C5CFF, #5DA9FF)', borderRadius: 8, boxShadow: '0 4px 12px rgba(124,92,255,0.3)' }} />
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <MockStatCard title="Total Revenue" value="₹1,24,500" icon={<TrendingUp size={20} />} color="#00E676" />
                  <MockStatCard title="Active Members" value="482" icon={<Users size={20} />} color="#00D4FF" />
                  <MockStatCard title="Action Required" value="14" icon={<RefreshCw size={20} />} color="#FFA000" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                  {/* Mock Graph/Activity */}
                  <div style={{ background: 'rgba(15,12,38,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'inset 0 2px 20px rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', display: 'flex', justifyContent: 'space-between' }}>
                      Attendance Heatmap
                      <div style={{ height: 16, width: 60, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Array.from({ length: 48 }).map((_, i) => {
                        // Use a deterministic pattern based on index instead of Math.random
                        const intensity = (Math.sin(i * 13) + 1) / 2; // Pseudo-random 0-1
                        let bg = 'rgba(255,255,255,0.03)';
                        if (intensity > 0.8) bg = 'rgba(0,212,255,0.8)';
                        else if (intensity > 0.5) bg = 'rgba(0,212,255,0.4)';
                        else if (intensity > 0.3) bg = 'rgba(0,212,255,0.2)';
                        return (
                          <div key={i} style={{ width: '22px', height: '22px', borderRadius: '4px', background: bg, border: '1px solid rgba(255,255,255,0.02)' }} />
                        )
                      })}
                    </div>
                  </div>

                  {/* Mock AI Insights */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(0,212,255,0.06))', border: '1px solid rgba(124,92,255,0.25)', borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(124,92,255,0.05)' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'radial-gradient(circle, rgba(124,92,255,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-light)', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Zap size={16} /> AI Insights
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '20px' }}>
                      <strong style={{ color: '#fff' }}>14 members</strong> are expiring this week. Sending automated WhatsApp reminders could recover <strong style={{ color: '#00E676' }}>₹28,000</strong> in revenue today.
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--blue-neon))', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '10px 16px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,92,255,0.3)' }}>
                      <MessageCircle size={14} /> Auto-Remind All
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section style={{ padding: '64px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
          <p style={{
            textAlign: 'center', fontSize: '12px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            color: 'var(--text-3)', marginBottom: '40px'
          }}>
            Enterprise-Grade Features, Built for Growth
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '24px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(124,92,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.02)'
                }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text)' }}>{f.title}</div>
                <p style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '80px 24px 100px',
          textAlign: 'center', width: '100%',
          background: 'radial-gradient(circle at 50% 0%, rgba(124,92,255,0.05) 0%, transparent 70%)'
        }}>
          <h2 style={{ marginBottom: '16px', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800 }}>Ready to run your gym smarter?</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '40px', fontSize: '16px', maxWidth: '500px', margin: '0 auto 40px' }}>
            Join hundreds of gym owners streamlining their operations. Setup takes less than 2 minutes.
          </p>
          <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '15px', height: '52px', boxShadow: '0 10px 30px rgba(124,92,255,0.35)' }}>
            Start Your Free Trial
          </button>
        </section>

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        color: 'var(--text-3)',
        fontSize: '12px'
      }}>
        <div>© 2026 Vyronix. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '12px' }}>Privacy Policy</button>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '12px' }}>Gym Login</button>
        </div>
      </footer>
    </div>
  );
};

export default Splash;
