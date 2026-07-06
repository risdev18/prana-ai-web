import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

export const registerGym = async ({ email, password, gymName, ownerName }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const gymData = {
      gymId: user.uid,
      gymName,
      ownerName,
      email,
      role: 'owner',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'Gyms', user.uid), gymData);
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
