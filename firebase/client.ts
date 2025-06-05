// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdCvTiyBo6EBRMt2m4apxZbwZKKFHMw-c",
  authDomain: "algointerview-dc422.firebaseapp.com",
  projectId: "algointerview-dc422",
  storageBucket: "algointerview-dc422.firebasestorage.app",
  messagingSenderId: "943416060805",
  appId: "1:943416060805:web:99a2ea223ca4c1614332ec",
  measurementId: "G-C0JJFJX49L",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
//export const googleAuthProvider = new GoogleAuthProvider();