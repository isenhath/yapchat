import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCGfm2455FXP--rE08DMyWmmHCDE96Mjtk",
    authDomain: "chat-app-25df4.firebaseapp.com",
    projectId: "chat-app-25df4",
    storageBucket: "chat-app-25df4.firebasestorage.app",
    messagingSenderId: "180503986260",
    appId: "1:180503986260:web:7a0307db13a94001f0edc1",
    measurementId: "G-Y6ERE297VZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);