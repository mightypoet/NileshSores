import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

// Test connection
async function testConnection() {
  try {
    // Attempt to get a dummy doc to check connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase configuration error: The client is offline. Please check your Firebase setup.");
    }
    // Other errors are expected if the doc doesn't exist, which is fine for a ping test
  }
}

testConnection();

export default app;
