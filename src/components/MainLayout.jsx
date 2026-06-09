import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text)' }}>
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area (offset by sidebar width) */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        
        {/* Global Background Elements for Premium feel */}
        <div style={{
           position: 'fixed', inset: 0,
           backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           opacity: 0.03,
           filter: 'contrast(1.2) grayscale(0.5)',
           pointerEvents: 'none', zIndex: 0
        }} />
        <div style={{
          position: 'fixed', top: '-20%', right: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        {/* Top Navigation */}
        <TopBar />

        {/* Page Content */}
        <main style={{ flex: 1, padding: '32px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
