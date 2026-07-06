import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

export const registerGym = async ({ email, password, gymName, ownerName }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const isSuperAdmin = ['anshu@admin.com', 'rishabhsonawane18@gmail.com', 'sonawaneanshu18@gmail.com'].includes(email.toLowerCase());
    
    const gymData = {
      gymId: user.uid,
      gymName,
      ownerName,
      email,
      role: isSuperAdmin ? 'superadmin' : 'owner',
      status: isSuperAdmin ? 'active' : 'pending',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'Gyms', user.uid), gymData);

    // If super admin is being created, also seed GlobalSettings
    if (isSuperAdmin) {
      await setDoc(doc(db, 'GlobalSettings', 'appSettings'), {
        websiteName: 'Vyronix',
        supportEmail: 'support@vyronix.com',
        supportPhone: 'Not Set',
        supportIdImage: '',
      });
    }
    return gymData;
  } catch (error) {
    throw error;
  }
};

export const loginGym = async ({ email, password }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const docRef = doc(db, 'Gyms', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }

    // If gym data is missing but this is the Super Admin, auto-create it
    const isSuperAdmin = ['anshu@admin.com', 'rishabhsonawane18@gmail.com', 'sonawaneanshu18@gmail.com'].includes(email.toLowerCase());
    if (isSuperAdmin) {
      const adminData = {
        gymId: user.uid,
        gymName: 'Super Admin',
        ownerName: 'Anshu',
        email: user.email,
        role: 'superadmin',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, adminData);

      // Also seed GlobalSettings if not already present
      const settingsRef = doc(db, 'GlobalSettings', 'appSettings');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        await setDoc(settingsRef, {
          websiteName: 'Vyronix',
          supportEmail: 'support@vyronix.com',
          supportPhone: 'Not Set',
          supportIdImage: '',
        });
      }
      return adminData;
    }

    throw new Error("Gym data not found. Please contact support.");
  } catch (error) {
    throw error;
  }
};

export const logoutGym = async () => {
  await signOut(auth);
};

export const resetPassword = async (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const getGymData = async (uid) => {
  try {
    const docRef = doc(db, 'Gyms', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const subscribeToGymData = (uid, callback) => {
  const docRef = doc(db, 'Gyms', uid);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Failed to subscribe to gym data:', error);
  });
};
