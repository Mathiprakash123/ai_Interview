import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAY4KijFYklDsABBPokJYACYLit0btkxbA",
  authDomain: "aiinterview-df8d8.firebaseapp.com",
  projectId: "aiinterview-df8d8",
  storageBucket: "aiinterview-df8d8.firebasestorage.app",
  messagingSenderId: "502511832025",
  appId: "1:502511832025:web:8049298edc26f15c6927c8"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// A check to see if the user has configured their Firebase project.
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-api-key';

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Failed to initialize Firebase", e);
    // You can add more specific error handling here if needed.
  }
} else {
  // This warning is for the developer to know that Firebase is not configured.
  console.warn('Firebase is not configured. Please add your project credentials to the .env file. App features relying on Firebase will be disabled.');
}

// Instead of throwing an error, we export the initialized services (or null).
// This allows the application to run without crashing, and components can
// gracefully handle the absence of Firebase.
export { app, auth, db };
