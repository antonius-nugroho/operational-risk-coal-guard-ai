import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import baseConfig from '../../firebase-applet-config.json';

// Support runtime environment variables with fallback to generated config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || baseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || baseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || baseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || baseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || baseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || baseConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID || baseConfig.firestoreDatabaseId
};

// Initialize Firebase App idempotently
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore targeting the custom databaseId specified in config
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export default app;
