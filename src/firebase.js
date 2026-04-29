import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtF0atf1iH8zWPYdxtgKkJt7KH9dzrBpc",
  authDomain: "balances-64616.firebaseapp.com",
  projectId: "balances-64616",
  storageBucket: "balances-64616.firebasestorage.app",
  messagingSenderId: "891046122820",
  appId: "1:891046122820:web:b99604c69597faee5d3311"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
