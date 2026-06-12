import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MemberProfileModal from './MemberProfileModal';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, CalendarCheck, MoreHorizontal, Plus } from 'lucide-react';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Glowing Mesh Orbs Backdrop */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 92, 255, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(100px)'
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '20%',
          width: '30vw',
          height: '30vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(93, 169, 255, 0.05) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }} />
      </div>

      {/* Fixed Sidebar for Desktop */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <TopBar onSelectMember={setSelectedMember} />
        <main style={{ flex: 1, padding: '24px', position: 'relative', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="bottom-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={24} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/members" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Users size={24} />
          <span>Members</span>
        </NavLink>
        <NavLink to="/attendance" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <CalendarCheck size={24} />
          <span>Attendance</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <MoreHorizontal size={24} />
          <span>More</span>
        </NavLink>
      </nav>

      {/* Global FAB for Mobile / Quick Actions */}
      <button 
        className="fab" 
        onClick={() => navigate('/add-member')}
        title="Add Member"
      >
        <Plus size={28} />
      </button>

      {/* Global Member Profile Slide-over Modal */}
      {selectedMember && currentUser && (
        <MemberProfileModal
          member={selectedMember}
          gymId={currentUser.uid}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default MainLayout;
