import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, onSnapshot, where, writeBatch, limit
} from 'firebase/firestore';
import { db } from './firebase';

// ─── GYM LOCATION (Geolocation Check-In) ───

export const getGymLocation = async (gymId) => {
  const gymRef = doc(db, 'Gyms', gymId);
  const snap = await getDoc(gymRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.gymLat == null || data.gymLng == null) return null;
  return {
    gymLat: data.gymLat,
    gymLng: data.gymLng,
    allowedRadius: data.allowedRadius || 100,
  };
};

export const updateGymLocation = async (gymId, { gymLat, gymLng, allowedRadius }) => {
  const gymRef = doc(db, 'Gyms', gymId);
  await updateDoc(gymRef, {
    gymLat,
    gymLng,
    allowedRadius: allowedRadius || 100,
  });
};

export const updateGymProfile = async (gymId, data) => {
  const gymRef = doc(db, 'Gyms', gymId);
  await updateDoc(gymRef, data);
};

// ─── MEMBER MANAGEMENT ───

export const addMember = async (gymId, member) => {
  const memberRef = doc(db, 'Gyms', gymId, 'Members', member.memberId);
  await setDoc(memberRef, member);
};

export const addMembersBatch = async (gymId, membersArray) => {
  const batch = writeBatch(db);
  membersArray.forEach(member => {
    const memberRef = doc(db, 'Gyms', gymId, 'Members', member.memberId);
    batch.set(memberRef, member);
  });
  await batch.commit();
};

export const deleteAllMembers = async (gymId) => {
  const membersRef = collection(db, 'Gyms', gymId, 'Members');
  const snapshot = await getDocs(membersRef);
  // Firestore batch limit is 500 — chunk if needed
  const chunks = [];
  let current = [];
  snapshot.docs.forEach((d, i) => {
    current.push(d);
    if (current.length === 490) { chunks.push(current); current = []; }
  });
  if (current.length > 0) chunks.push(current);
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
};


export const updateMember = async (gymId, member) => {
  const memberRef = doc(db, 'Gyms', gymId, 'Members', member.memberId);
  // updateDoc is intentional — Firestore security rules allow unauthenticated updates
  // only when affectedKeys().hasOnly(['password', 'phone']).
  // Callers (especially MemberPortal) must only pass those fields for portal writes.
  await updateDoc(memberRef, member);
};


export const deleteMember = async (gymId, memberId) => {
  // memberId here is the Firestore document ID (d.id from onSnapshot)
  const memberRef = doc(db, 'Gyms', gymId, 'Members', memberId);
  await deleteDoc(memberRef);
};

export const subscribeToMembers = (gymId, callback) => {
  // No orderBy to avoid missing composite index — sort in-memory
  const q = collection(db, 'Gyms', gymId, 'Members');
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs
      .map(d => ({ ...d.data(), id: d.id }))
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db2 - da;
      });
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
  // No orderBy to avoid missing composite index issues — sort in-memory instead
  const q = collection(db, 'Gyms', gymId, 'Members');
  const snapshot = await getDocs(q);
  const members = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
  return members.sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db2 - da;
  });
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

// Returns the full attendance record object (or null)
export const getAttendanceRecordFull = async (gymId, dateStr, memberId) => {
  const attendanceRef = doc(db, 'Gyms', gymId, 'Attendance', dateStr, 'Records', memberId);
  const snap = await getDoc(attendanceRef);
  if (!snap.exists()) return null;
  return snap.data();
};

export const markAttendance = async (gymId, dateStr, memberId, memberName) => {
  const attendanceRef = doc(db, 'Gyms', gymId, 'Attendance', dateStr, 'Records', memberId);
  await setDoc(attendanceRef, {
    memberId,
    memberName,
    checkInTime: new Date().toISOString(),
    checkOutTime: null,
    status: 'Present'
  });
};

export const updateCheckOutTime = async (gymId, dateStr, memberId) => {
  const attendanceRef = doc(db, 'Gyms', gymId, 'Attendance', dateStr, 'Records', memberId);
  await updateDoc(attendanceRef, {
    checkOutTime: new Date().toISOString(),
    status: 'Completed'
  });
};

export const subscribeToAttendance = (gymId, dateStr, callback) => {
  // No orderBy to avoid missing composite index — sort in-memory
  const q = collection(db, 'Gyms', gymId, 'Attendance', dateStr, 'Records');
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs
      .map(d => ({ ...d.data(), id: d.id }))
      .sort((a, b) => {
        const ta = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
        const tb = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
        return tb - ta;
      });
    callback(records);
  });
};

// ─── LEADS / ENQUIRIES (CRM) ───

export const addEnquiry = async (gymId, enquiry) => {
  const enquiryRef = doc(collection(db, 'Gyms', gymId, 'Enquiries'));
  await setDoc(enquiryRef, { ...enquiry, id: enquiryRef.id, createdAt: new Date().toISOString() });
};

export const updateEnquiry = async (gymId, enquiryId, data) => {
  const enquiryRef = doc(db, 'Gyms', gymId, 'Enquiries', enquiryId);
  await updateDoc(enquiryRef, data);
};

export const subscribeToEnquiries = (gymId, callback) => {
  const q = query(collection(db, 'Gyms', gymId, 'Enquiries'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
  });
};

// ─── TRANSACTIONS (FINANCES) ───

export const addTransaction = async (gymId, transaction) => {
  const transRef = doc(collection(db, 'Gyms', gymId, 'Transactions'));
  await setDoc(transRef, { ...transaction, id: transRef.id, createdAt: new Date().toISOString() });
};

export const subscribeToTransactions = (gymId, callback) => {
  const q = query(collection(db, 'Gyms', gymId, 'Transactions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
  });
};

// ─── AUDIT LOGS ───

export const logAudit = async (gymId, userId, action, details) => {
  try {
    const auditRef = doc(collection(db, 'Gyms', gymId, 'AuditLogs'));
    await setDoc(auditRef, {
      id: auditRef.id,
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

// ─── STAFF MANAGEMENT ───

export const addStaff = async (gymId, staff) => {
  const staffRef = doc(collection(db, 'Gyms', gymId, 'Staff'));
  await setDoc(staffRef, { ...staff, id: staffRef.id, createdAt: new Date().toISOString() });
};

export const updateStaff = async (gymId, staffId, data) => {
  const staffRef = doc(db, 'Gyms', gymId, 'Staff', staffId);
  await updateDoc(staffRef, data);
};

export const subscribeToStaff = (gymId, callback) => {
  const q = query(collection(db, 'Gyms', gymId, 'Staff'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
  });
};

// ─── ACTIVITY TIMELINE ───

export const addTimelineEvent = async (gymId, memberId, event) => {
  const eventRef = doc(collection(db, 'Gyms', gymId, 'ActivityTimeline'));
  await setDoc(eventRef, {
    ...event,
    memberId,
    id: eventRef.id,
    timestamp: new Date().toISOString()
  });
};

export const subscribeToMemberTimeline = (gymId, memberId, callback) => {
  const q = query(
    collection(db, 'Gyms', gymId, 'ActivityTimeline'),
    where('memberId', '==', memberId),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
  });
};

export const subscribeToRecentActivity = (gymId, callback) => {
  const q = query(
    collection(db, 'Gyms', gymId, 'ActivityTimeline'),
    orderBy('timestamp', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
  });
};

// ─── MEMBER QUERIES / COMPLAINTS ───

export const addQuery = async (gymId, queryData) => {
  const queryRef = doc(collection(db, 'Gyms', gymId, 'Queries'));
  await setDoc(queryRef, {
    ...queryData,
    id: queryRef.id,
    status: 'Open',
    followUpNotes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return queryRef.id;
};

export const subscribeToQueries = (gymId, callback) => {
  const q = query(
    collection(db, 'Gyms', gymId, 'Queries'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
  });
};

export const updateQuery = async (gymId, queryId, data) => {
  const queryRef = doc(db, 'Gyms', gymId, 'Queries', queryId);
  await updateDoc(queryRef, { ...data, updatedAt: new Date().toISOString() });
};

export const deleteQuery = async (gymId, queryId) => {
  const queryRef = doc(db, 'Gyms', gymId, 'Queries', queryId);
  await deleteDoc(queryRef);
};

// ─── HELPER: GET MEMBER STATUS ───
export const getMemberStatus = (endDateStr) => {
  if (!endDateStr) return 'Unknown';
  const today = new Date();
  const end = new Date(endDateStr);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 7) return 'Expiring Soon';
  return 'Active';
};
