import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Safe local storage mock to prevent Firebase crashes in incognito/strict-privacy browsers
try {
  if (typeof window !== 'undefined') {
    const test = window.localStorage;
    test.getItem('test');
  }
} catch (e) {
  console.warn("localStorage access denied. Mocking in memory to prevent crashes.");
  const memStorage = {};
  try {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key) => memStorage[key] || null,
        setItem: (key, val) => { memStorage[key] = val; },
        removeItem: (key) => { delete memStorage[key]; },
        clear: () => { for (let key in memStorage) delete memStorage[key]; },
        get length() { return Object.keys(memStorage).length; },
        key: (i) => Object.keys(memStorage)[i] || null,
      },
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (err) {
    console.warn("Could not redefine localStorage:", err);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Firestore with offline persistence (Firebase v12+ API)
// Falls back to in-memory cache if IndexedDB is unavailable (iOS Safari private mode, etc.)
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (err) {
  console.warn('Firestore persistent cache unavailable, using memory cache:', err);
  db = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
}

export { db };
