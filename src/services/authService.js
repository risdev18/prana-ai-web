import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const registerGym = async ({ email, password, gymName, ownerName }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const isSuperAdmin = email.toLowerCase() === 'anshu@admin.com';
    
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
        websiteName: 'Prana AI',
        supportEmail: email,
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
    } else {
      throw new Error("Gym data not found");
    }
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
  const docRef = doc(db, 'Gyms', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return docSnap.data();
  return null;
};
