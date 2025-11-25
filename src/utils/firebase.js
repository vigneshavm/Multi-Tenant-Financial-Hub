import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// --- Configuration loaded via standard environment variables (e.g., from .env.local) ---

// Load JSON config string and parse it, defaulting to empty object if not set.
// NOTE: REACT_APP_FIREBASE_CONFIG must be a valid JSON string containing the config object.
const rawFirebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG || '{}';
const firebaseConfig = JSON.parse(rawFirebaseConfig);

// Load other required environment variables
export const initialAuthToken = process.env.REACT_APP_INITIAL_AUTH_TOKEN || null;
export const appId = process.env.REACT_APP_APP_ID || 'textile-biz-manager';

let db = null;
let auth = null;
let app = null;

// Initialize Firebase services if configuration is available
if (Object.keys(firebaseConfig).length > 0) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        // Enable detailed logging for debugging Firestore operations
        setLogLevel('debug');
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
}

/**
 * Generates the Firestore collection path for multi-tenancy.
 * Path structure: artifacts/{appId}/users/{organizationId}/{collectionName} (5 segments)
 */
export const getCollectionPath = (organizationId, collectionName) => {
    if (!organizationId) return null;
    return `artifacts/${appId}/users/${organizationId}/${collectionName}`;
};

// Export the initialized services
export { db, auth, app };