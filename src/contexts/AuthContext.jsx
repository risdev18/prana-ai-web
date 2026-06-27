import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getGymData, logoutGym } from '../services/authService';

const PERMISSIONS = {
  superadmin: [
    'superdashboard', 'supergyms', 'supersettings', 'supertickets'
  ],
  owner: [
    'dashboard', 'members', 'renewals', 'attendance', 'leads', 'queries',
    'workouts', 'assessments', 'trainers', 'settings', 'expenses', 'tickets', 'reports', 'support'
  ],
  manager: [
    'dashboard', 'members', 'renewals', 'attendance', 'leads', 'queries',
    'workouts', 'assessments', 'trainers', 'tickets', 'support'
  ],
  trainer: [
    'members', 'workouts', 'assessments', 'attendance'
  ],
  frontdesk: [
    'dashboard', 'members', 'renewals', 'attendance', 'leads', 'queries'
  ]
};

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [gymData, setGymData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout: if Firebase never responds (e.g. localStorage crash),
    // force loading=false after 5s so the app doesn't show a blank screen.
    const safetyTimer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn('AuthContext: Firebase did not respond in 5s. Forcing app render.');
        }
        return false;
      });
    }, 5000);

    let unsubscribe = () => {};

    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        clearTimeout(safetyTimer);
        setCurrentUser(user);
        if (user) {
          try {
            const data = await getGymData(user.uid);
            setGymData(data);
          } catch (err) {
            console.error('Failed to load gym data:', err);
          }
        } else {
          setGymData(null);
        }
        setLoading(false);
      });
    } catch (err) {
      console.error('Firebase onAuthStateChanged failed:', err);
      clearTimeout(safetyTimer);
      setLoading(false);
    }

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const refreshGymData = async () => {
    if (currentUser) {
      try {
        const data = await getGymData(currentUser.uid);
        setGymData(data);
      } catch (err) {
        console.error('Failed to refresh gym data:', err);
      }
    }
  };

  const hasPermission = (feature) => {
    if (!gymData) return false;
    // Fallback to 'owner' if no role is defined (for backward compatibility)
    const role = gymData.role || 'owner';
    const userPermissions = PERMISSIONS[role.toLowerCase()] || [];
    return userPermissions.includes(feature);
  };

  const value = {
    currentUser,
    gymData,
    logout: logoutGym,
    refreshGymData,
    hasPermission,
    userRole: gymData?.role || 'owner'
  };


  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
