import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: 'ttasaciones-5ce4d', // EXPLICIT PROJECT ID AS REQUESTED
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

    // Modern Persistence Initialization
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    });

    auth = getAuth(app);

    console.log("Firebase Initialized (Modern Persistence Enabled)");
} catch (e) {
    console.error("Firebase Initialization Failed:", e);
}

export { db, auth, googleProvider };
