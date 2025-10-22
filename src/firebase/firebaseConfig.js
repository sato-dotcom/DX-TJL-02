import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// NOTE: This configuration is for the user's existing Firebase project.
const firebaseConfig = {
  apiKey: "AIzaSyCAnRt7rKpHwlEaQtfco-Mr4ZgVPiBKMmU",
  authDomain: "dx-tjl-honsya.firebaseapp.com",
  projectId: "dx-tjl-honsya",
  storageBucket: "dx-tjl-honsya.appspot.com",
  messagingSenderId: "62684255767",
  appId: "1:62684255767:web:e17ae7af4db528a9edee52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export firestore and auth instances to be used in other parts of the app
export const db = getFirestore(app);
export const auth = getAuth(app);
