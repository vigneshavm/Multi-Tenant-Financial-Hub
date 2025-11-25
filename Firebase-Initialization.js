import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// Global variables provided by the execution environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
export const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'textile-biz-manager';

let db = null;
let auth = null;
let app = null;

if (Object.keys(firebaseConfig).length > 0) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        setLogLevel('debug');
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
}

/**
 * Generates the Firestore collection path for multi-tenancy.
 * Path: artifacts/{appId}/users/{organizationId}/{collectionName} (5 segments)
 */
export const getCollectionPath = (organizationId, collectionName) => {
    if (!organizationId) return null;
    return `artifacts/${appId}/users/${organizationId}/${collectionName}`;
};

export { db, auth, app };
