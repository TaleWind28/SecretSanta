//firebase

// Import the functions you need from the SDKs you need

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_USER_API_KEY,
  authDomain: import.meta.env.FIREBASE_USER_AUTH_DOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.FIREBASE_USER_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.FIREBASE_USER_MESSAGING_SENDER_ID,
  appId: import.meta.env.FIREBASE_USER_APP_ID
};

import {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY
} from '$env/static/private';

const privateKey = FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey
  })
});

// // Initialize Firebase
// export const app = initializeApp(firebaseConfig);
export const db = getFirestore();