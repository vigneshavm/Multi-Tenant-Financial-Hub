import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // getAuth is a value
import type { Auth } from 'firebase/auth'; // <--- Add 'type' keyword here for Auth
import { getFirestore, Firestore, setLogLevel } from 'firebase/firestore';

// --- Type Definitions ---

// Define the required structure for the Firebase configuration object
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string; // Optional
}

// --- Configuration loaded via standard environment variables ---

// Load JSON config string and parse it, defaulting to empty object if not set.
// Fix: Use import.meta.env.VITE_FIREBASE_CONFIG instead of REACT_APP_FIREBASE_CONFIG for Vite
const rawFirebaseConfig = import.meta.env.VITE_FIREBASE_CONFIG || '{}';

let firebaseConfig: Partial<FirebaseConfig>;

try {
    // Attempt to parse the JSON string into the FirebaseConfig structure
    firebaseConfig = JSON.parse(rawFirebaseConfig);
} catch (e) {
    console.error("Error parsing VITE_FIREBASE_CONFIG:", e);
    firebaseConfig = {};
}

// Load other required environment variables
// Fix: Use VITE_ prefix for Vite environment variables
export const initialAuthToken: string | null = import.meta.env.VITE_INITIAL_AUTH_TOKEN || null;
// Ensure appId is explicitly a string
export const appId: string = import.meta.env.VITE_APP_ID || 'textile-biz-manager';

// Initialize variables with their specific TypeScript types, defaulting to null
let db: Firestore | null = null;
// Fix: Remove 'any' type
let auth: Auth | null = null;
let app: FirebaseApp | null = null;

// Initialize Firebase services if configuration is available
if (Object.keys(firebaseConfig).length > 0) {
    try {
        // App initialization
        app = initializeApp(firebaseConfig as FirebaseConfig); 
        
        // Service initialization
        db = getFirestore(app);
        auth = getAuth(app);
        
        // Enable detailed logging for debugging Firestore operations
        // setLogLevel('debug'); // Commented out for production, uncomment for debugging
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
}

/**
 * Generates the Firestore collection path for multi-tenancy.
 * Path structure: artifacts/{appId}/users/{organizationId}/{collectionName} (5 segments)
 */
export const getCollectionPath = (organizationId: string | null, collectionName: string): string | null => {
    if (!organizationId) return null;
    return `artifacts/${appId}/users/${organizationId}/${collectionName}`;
};

// Export the initialized services
export { db, auth, app };