import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDQvgnlghzELVhMVCzBsmP6fsAdDQYsDU",
  authDomain: "simios-stadio.firebaseapp.com",
  projectId: "simios-stadio",
  storageBucket: "simios-stadio.appspot.com", // <--- corregido
  messagingSenderId: "216670567002",
  appId: "1:216670567002:web:bead568ccd6252a6bef663"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
