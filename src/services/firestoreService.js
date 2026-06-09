import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  getDocs, query, orderBy, onSnapshot, where
} from 'firebase/firestore';
import { db } from './firebase';

// ─── MEMBER MANAGEMENT ───

export const addMember = async (gymId, member) => {
  const memberRef = doc(db, 'Gyms', gymId, 'Members', member.memberId);
  await setDoc(memberRef, member);
};

export const updateMember = async (gymId, member) => {
  const memberRef = doc(db, 'Gyms', gymId, 'Members', member.memberId);
  await updateDoc(memberRef, member);
};

export const deleteMember = async (gymId, memberId) => {
  const memberRef = doc(db, 'Gyms', gymId, 'Members', memberId);
  await deleteDoc(memberRef);
};

export const subscribeToMembers = (gymId, callback) => {
  const q = query(
    collection(db, 'Gyms', gymId, 'Members'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    callback(members);
  });
};

// ─── MEMBER PORTAL: Find gym by name ───

export const findGymByName = async (searchName) => {
  const gymsRef = collection(db, 'Gyms');
  const snapshot = await getDocs(gymsRef);
  const results = [];
  const lower = searchName.toLowerCase();
  snapshot.forEach(d => {
    const gym = d.data();
    if (gym.gymName && gym.gymName.toLowerCase().includes(lower)) {
      results.push({ ...gym, gymId: d.id });
    }
  });
  return results;
};

// ─── MEMBER PORTAL: Get all members of a gym ───

export const getMembersByGymId = async (gymId) => {
  const q = query(
    collection(db, 'Gyms', gymId, 'Members'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
};

// ─── ASSESSMENT HISTORY ───

export const saveAssessment = async (gymId, memberId, assessment) => {
  const assessmentRef = doc(
    db, 'Gyms', gymId, 'Members', memberId, 'Assessments', assessment.assessmentId
  );
  await setDoc(assessmentRef, assessment);
};

export const subscribeToAssessments = (gymId, memberId, callback) => {
  const q = query(
    collection(db, 'Gyms', gymId, 'Members', memberId, 'Assessments'),
    orderBy('assessmentDate', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const assessments = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    callback(assessments);
  });
};

// ─── ATTENDANCE SYSTEM ───

export const getMemberByShortId = async (gymId, shortId) => {
  const q = query(collection(db, 'Gyms', gymId, 'Members'), where('shortId', '==', shortId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };
};

export const getAttendanceRecord = async (gymId, dateStr, memberId) => {
  const q = query(
    collection(db, 'Gyms', gymId, 'Attendance', dateStr, 'Records'),
    where('memberId', '==', memberId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty; // true if already marked
};

export const markAttendance = async (gymId, dateStr, memberId, memberName) => {
  const attendanceRef = doc(db, 'Gyms', gymId, 'Attendance', dateStr, 'Records', memberId);
  await setDoc(attendanceRef, {
    memberId,
    memberName,
    checkInTime: new Date().toISOString(),
    status: 'Present'
  });
};

export const subscribeToAttendance = (gymId, dateStr, callback) => {
  const q = query(
    collection(db, 'Gyms', gymId, 'Attendance', dateStr, 'Records'),
    orderBy('checkInTime', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    callback(records);
  });
};
