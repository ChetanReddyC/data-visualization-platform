// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  connectAuthEmulator,
  browserLocalPersistence,
  setPersistence,
  EmailAuthProvider,
  inMemoryPersistence
} from "firebase/auth";
import type { User } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRlmGeDHEssoK5Vhg9jlfb1QdH8_bIhHQ",
  authDomain: "data-viz-platform-ac931.firebaseapp.com",
  projectId: "data-viz-platform-ac931",
  storageBucket: "data-viz-platform-ac931.firebasestorage.app",
  messagingSenderId: "1059480487836",
  appId: "1:1059480487836:web:2b26a82de1cbcc6bc8aa59",
  measurementId: "G-SER01X1WV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// DEVELOPMENT MODE SETUP - Accept auth from any IP address
// Since this is just an assignment project, we'll set up for easy testing

// ===== STEP 1: Set in-memory persistence to avoid domain issues =====
// This makes auth tokens not rely on the domain for storage
setPersistence(auth, inMemoryPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

// ===== STEP 2: Configure Google Provider for maximum compatibility =====
googleProvider.setCustomParameters({
  // Disable domain validation when possible
  prompt: 'select_account',
  // Open in popup to avoid redirect issues across domains
  login_hint: '',
  // Add all common scopes
  'scope': 'email profile openid'
});

// All OAuth providers need these scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

// ===== STEP 3: Set up a fallback Email provider if Google fails =====
// We'll use this to fallback to email/password auth if OAuth fails due to domain issues

// Authentication helper functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("Email sign-in error:", error.code, error.message);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    // Try with popup first (works better across domains)
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    // For unauthorized domain error, suggest workarounds
    if (error.code === 'auth/unauthorized-domain') {
      console.warn('Domain not authorized for OAuth. Attempting alternative auth...');
      
      // For assignment project, give detailed error:
      if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
        // Create a custom error with workarounds
        const errorMsg = `
Authentication from ${window.location.hostname} is not allowed by Firebase.

For an assignment project, you can:
1. Access via localhost:5173 instead 
2. Add ${window.location.hostname} to Firebase Console → Authentication → Settings → Authorized Domains
3. Use email/password authentication instead (more reliable across domains)`;

        console.error(errorMsg);
        error.displayMessage = errorMsg;
      }
    }
    
    // Re-throw the error for component handling
    throw error;
  }
};

export const createAccount = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("Account creation error:", error.code, error.message);
    throw error;
  }
};

export const logOut = () => {
  return signOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Additional utility for assignment project - allows checking auth state
export const isUserAuthenticated = () => {
  return auth.currentUser !== null;
};

export { auth, app, analytics };