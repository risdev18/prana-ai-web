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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-container" style={{ position: 'relative' }}>


      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      {/* Fixed Sidebar for Desktop & Slide-over for Mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <TopBar onSelectMember={setSelectedMember} onMenuClick={() => setIsSidebarOpen(true)} />
        <main style={{ flex: 1, position: 'relative', overflowX: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '24px 16px 100px' }}>
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
