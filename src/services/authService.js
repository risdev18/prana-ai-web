import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

export const getGymData = async (uid) => {
  const docRef = doc(db, 'Gyms', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return docSnap.data();
  return null;
};
