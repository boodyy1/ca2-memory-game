import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQ5sBVY4r622nBmtZyOQ-_ACBN-NALhZg",
  authDomain: "ca2web.firebaseapp.com",
  projectId: "ca2web",
  storageBucket: "ca2web.firebasestorage.app",
  messagingSenderId: "283580519332",
  appId: "1:283580519332:web:56162a21187a5366f92731"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
