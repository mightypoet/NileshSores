import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Use the firestoreDatabaseId if provided in config, otherwise default
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const storage = getStorage(app);

async function testConnection() {
  console.log("Testing Firebase connection for project:", firebaseConfig.projectId);
  try {
    // Attempt to fetch something from an existing collection to test connectivity
    const testDoc = await getDocFromServer(doc(db, 'products', 'test-connection'));
    console.log("Firebase connection test complete. Status:", testDoc.exists() ? "Document exists" : "Document not found (this is normal)");
  } catch (error: any) {
    console.error("Firebase connection test failed for project:", firebaseConfig.projectId);
    console.error("Full Error Object:", JSON.stringify(error, null, 2));
    
    if (error?.message?.includes('the client is offline')) {
      console.error("ERROR: The client is offline or cannot reach the server. This often means the Project ID is incorrect, Firestore is not enabled, or the API key is restricted.");
    } else if (error?.code === 'permission-denied') {
      console.error("ERROR: Permission denied. Your Firebase Security Rules might be blocking the test connection.");
    } else {
      console.error("ERROR: ", error?.message || "Unknown error occurred during connection test.");
    }
  }
}
async function checkAuth() {
  try {
    console.log("Firebase Auth Domain:", firebaseConfig.authDomain);
    onAuthStateChanged(auth, (user) => {
      console.log("Auth State Changed:", user ? "User: " + user.email : "No user logged in");
    });
  } catch (error) {
    console.error("Auth listener setup failed:", error);
  }
}
testConnection();
checkAuth();
