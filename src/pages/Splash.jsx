import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Users, Shield, Zap, Activity, Flame, Heart, ArrowRight } from 'lucide-react';

const FloatingIcon = ({ Icon, top, left, delay, color, size }) => (
  <div style={{
    position: 'absolute', top, left,
    animation: `pulse-glow 6s ${delay}s ease-in-out infinite`,
    color, opacity: 0.1, pointerEvents: 'none',
    transform: 'rotate(-15deg)'
  }}>
    <Icon size={size} />
  </div>
);

const Splash = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(() => navigate('/dashboard'), 1500);
      return () => clearTimeout(timer);
    }
    
    const handleMouseMove = (e) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth - 0.5) * 30, 
        y: (e.clientY / window.innerHeight - 0.5) * 30 
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [currentUser, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: '#020204', // Pitch black
      padding: '40px 20px'
    }}>

      {/* PARALLAX BACKGROUND */}
      <div style={{
        position: 'absolute', inset: -100,
        transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`,
        transition: 'transform 0.1s ease-out',
        pointerEvents: 'none', zIndex: 0
      }}>
        <div style={{
           position: 'absolute', inset: 0,
           backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           opacity: 0.25,
           filter: 'contrast(1.2) grayscale(0.2)',
           mixBlendMode: 'screen'
        }} />
        
        {/* Massive Glow Orbs */}
        <div style={{
          position: 'absolute', top: '10%', left: '15%',
          width: '80vw', height: '80vw', maxWidth: '800px', maxHeight: '800px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)', animation: 'pulse-glow 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '0%', right: '10%',
          width: '70vw', height: '70vw', maxWidth: '700px', maxHeight: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,214,160,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)', animation: 'pulse-glow 10s 2s ease-in-out infinite'
        }} />
        
        {/* Floating Icons */}
        <FloatingIcon Icon={Dumbbell} top="20%" left="15%" delay={0} color="#6366f1" size={140} />
        <FloatingIcon Icon={Activity} top="65%" left="20%" delay={2} color="#06d6a0" size={100} />
        <FloatingIcon Icon={Flame} top="15%" left="75%" delay={1} color="#f43f5e" size={160} />
        <FloatingIcon Icon={Heart} top="75%" left="80%" delay={3} color="#f59e0b" size={110} />
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E")',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* HERO SECTION */}
      <div style={{ zIndex: 1, textAlign: 'center', marginBottom: '60px' }} className="animate-fade-up">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '8px 24px', borderRadius: '999px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)', marginBottom: '30px',
          color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <span style={{ position: 'relative', display: 'flex', h: 8, w: 8 }}>
            <span style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: '#06d6a0', opacity: 0.75 }}></span>
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', background: '#06d6a0' }}></span>
          </span>
          Next-Gen AI Fitness Platform
        </div>
        
        <h1 style={{
          fontSize: 'clamp(3.5rem, 8vw, 7rem)', 
          fontFamily: 'var(--font-head)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-0.04em',
          margin: 0,
          background: 'linear-gradient(to bottom right, #ffffff 0%, #a5b4fc 50%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 10px 30px rgba(99,102,241,0.3))'
        }}>
          PRANA AI
        </h1>
        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: 'var(--text-2)',
          marginTop: '20px', maxWidth: '600px', margin: '20px auto 0',
          fontWeight: 400, lineHeight: 1.6
        }}>
          The ultimate intelligent ecosystem. Empowering gym owners and transforming member experiences with AI-driven insights.
        </p>
      </div>

      {/* MASSIVE PORTAL CARDS */}
      <div className="animate-fade-up-2" style={{ 
        zIndex: 1, display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center',
        width: '100%', maxWidth: '900px'
      }}>
        {/* Gym Owner Portal */}
        <div
          onClick={() => navigate('/login')}
          style={{
            flex: '1 1 350px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '24px',
            padding: '40px 32px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 30px 60px rgba(99,102,241,0.25)';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.05) 100%)';
            e.currentTarget.querySelector('.arrow-icon').style.transform = 'translateX(10px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            e.currentTarget.querySelector('.arrow-icon').style.transform = 'translateX(0)';
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
          }} />
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(99,102,241,0.4)',
            marginBottom: '24px'
          }}>
            <Shield size={36} color="#fff" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', marginBottom: '12px', color: '#fff' }}>
            Gym Owner
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '30px' }}>
            Full control over your facility. Add members, track metrics, and generate AI workout plans instantly.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', color: '#a5b4fc', fontWeight: 600, fontSize: '1.1rem' }}>
            Enter Portal <ArrowRight className="arrow-icon" size={20} style={{ marginLeft: '10px', transition: 'transform 0.3s' }} />
          </div>
        </div>

        {/* Member Portal */}
        <div
          onClick={() => navigate('/member-portal')}
          style={{
            flex: '1 1 350px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(6,214,160,0.2)',
            borderRadius: '24px',
            padding: '40px 32px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 30px 60px rgba(6,214,160,0.25)';
            e.currentTarget.style.borderColor = 'rgba(6,214,160,0.6)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,214,160,0.15) 0%, rgba(8,145,178,0.05) 100%)';
            e.currentTarget.querySelector('.arrow-icon').style.transform = 'translateX(10px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(6,214,160,0.2)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            e.currentTarget.querySelector('.arrow-icon').style.transform = 'translateX(0)';
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #06d6a0, #0891b2)'
          }} />
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #06d6a0, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(6,214,160,0.4)',
            marginBottom: '24px'
          }}>
            <Users size={36} color="#fff" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', marginBottom: '12px', color: '#fff' }}>
            I'm a Member
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '30px' }}>
            Access your personalized AI fitness plan, update your progress, and view your custom diet securely.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', color: '#06d6a0', fontWeight: 600, fontSize: '1.1rem' }}>
            Enter Portal <ArrowRight className="arrow-icon" size={20} style={{ marginLeft: '10px', transition: 'transform 0.3s' }} />
          </div>
        </div>
      </div>

      <div className="animate-fade-up-3" style={{ zIndex: 1, marginTop: '50px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-3)', fontSize: '0.95rem' }}>
          Don't have an account yet?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ 
              color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600,
              borderBottom: '1px solid var(--primary-light)', paddingBottom: '2px'
            }}
          >
            Register your gym
          </span>
        </p>
      </div>

    </div>
  );
};

export default Splash;
