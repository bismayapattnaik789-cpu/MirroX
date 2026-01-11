
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuration for MirrorX (mirrorx-32bc2)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBwTa_Z6CbRPLOd_FdnBhnbK9aApz-kCr8",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "mirrorx-32bc2.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "mirrorx-32bc2",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "mirrorx-32bc2.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "836098595860",
  appId: process.env.FIREBASE_APP_ID || "1:836098595860:web:790b2c9520f4df7cdb5b01",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-W7278M6EY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services (only if in browser environment)
let analytics = null;
let messaging = null;

if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    messaging = getMessaging(app);
    console.log("Firebase Services initialized");
  } catch (e) {
    console.warn("Firebase Services failed to initialize", e);
  }
}

export { app, analytics, messaging, getToken, onMessage };
