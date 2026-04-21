import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

// Type assertion for config
const firebaseConfig = firebaseConfigData as any;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Note: Firestore and Storage are being phased out in favor of Supabase and Vercel Blob.
// We keep the initialization for backwards compatibility during migration if needed,
// but top-level connection tests are removed to prevent permission errors.
