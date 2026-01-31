// frontend/app/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3S3aEHMtejoiN3cySSv6P8KcxHPdxK5s",
  authDomain: "priceai-390a2.firebaseapp.com",
  projectId: "priceai-390a2",
  storageBucket: "priceai-390a2.firebasestorage.app",
  messagingSenderId: "1013278530259",
  appId: "1:1013278530259:web:e3f5b89b0ed7fe74999226"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);