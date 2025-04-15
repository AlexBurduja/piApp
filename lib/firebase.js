// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAV-iW49MWJ6x-a2y_CFMaCoX5g6ecmCl4",
  authDomain: "pigames-c9724.firebaseapp.com",
  projectId: "pigames-c9724",
  storageBucket: "pigames-c9724.firebasestorage.app",
  messagingSenderId: "138388642772",
  appId: "1:138388642772:web:38f32ff596af84d9d69441",
  measurementId: "G-90VER9J9FH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };