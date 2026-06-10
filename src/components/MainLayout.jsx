import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { LayoutDashboard, Users, CalendarCheck, MoreHorizontal, Plus } from 'lucide-react';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      {/* Fixed Sidebar for Desktop */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="main-content">
        <TopBar />
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
    </div>
  );
};

export default MainLayout;
