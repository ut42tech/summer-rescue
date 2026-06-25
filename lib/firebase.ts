import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let cachedAccessToken: string | null = null;

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential) {
      cachedAccessToken = credential.accessToken || null;
    }
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export const getAccessToken = () => cachedAccessToken;

export { app, auth, db, signInWithGoogle, logout, onAuthStateChanged };
