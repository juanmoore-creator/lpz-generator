import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let db: any;
let auth: any;
const googleProvider = new GoogleAuthProvider();

try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    console.log("Configuración cargada para el proyecto:", firebaseConfig.projectId);
    console.log("Firestore Instance Project ID:", db.app.options.projectId);

    // Enable Multi-Tab Offline Persistence - TEMPORARILY DISABLED
    // enableMultiTabIndexedDbPersistence(db).catch((err) => {
    //     if (err.code == 'failed-precondition') {
    //         console.warn('Persistence failed: Multiple tabs open (and multi-tab not supported by browser?).');
    //     } else if (err.code == 'unimplemented') {
    //         console.warn('Persistence not supported by browser.');
    //     } else {
    //         console.warn('Persistence failed for unknown reason:', err);
    //     }
    // });

    console.log("Firebase Initialized (Persistence Disabled)");
} catch (e) {
    console.error("Firebase Initialization Failed:", e);
}

export { db, auth, googleProvider };
