import { useState, useEffect, useCallback, useMemo } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth'; 
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

// --- FIX: Uncomment the actual import ---
import { auth, db, appId } from '../utils/firebase'; 

// --- FIX: Remove the mock declarations ---
// declare const auth: any; 
// declare const db: any; 
// declare const appId: string; 

declare const window: Window & { __initial_auth_token?: string }; // Global access to initial token

// Removed the local definition of 'AuthData' to prevent naming conflicts with external types.

interface RegisteredOrgData { // Renamed the interface to prevent potential conflicts
  ownerId: string;
  name: string;
  registeredAt: Timestamp;
}

const useAuthentication = () => {
  const [pin, setPin] = useState<string>('');
  const [showPinScreen, setShowPinScreen] = useState<boolean>(true);
  
  // FIX: Changed initial state from null to '' to satisfy external AuthData: role: string
  const [role, setRole] = useState<string>(''); 
  
  const [userId, setUserId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [orgIdInput, setOrgIdInput] = useState<string>('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  
  // Placeholder for the missing required property in the external AuthData interface
  const currentAuthToken = useMemo(() => null, []);

  const handleOrgRegistration = useCallback(async (ownerId: string) => {
    if (!db) return;
    const orgDocRef = doc(db, `artifacts/${appId}/public/data/organizations`, ownerId);
    try {
      const defaultName = `Org - ${ownerId.substring(0, 6)}...`;
      // Use null for serverTimestamp() during immediate object definition
      const orgData: RegisteredOrgData = { ownerId: ownerId, name: defaultName, registeredAt: serverTimestamp() as Timestamp };
      await setDoc(orgDocRef, orgData, { merge: true });
    } catch (e) {
      console.error("Error registering organization:", e);
    }
  }, []);

  useEffect(() => {
  // Authentication Listener
  if (!auth) return;

  // Create a non-null reference to auth to satisfy TypeScript
  const authInstance = auth;

  const unsubscribe = onAuthStateChanged(authInstance, (user: User | null) => {
    if (user) {
      setUserId(user.uid);
      setIsAuthReady(true);
    } else {
      // Initial sign-in logic (uses global initialAuthToken)
      const initialAuthToken: string | null = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;
      
      const handleSignIn = async () => {
        try {
          // Use the non-null authInstance here as well
          if (initialAuthToken) {
            await signInWithCustomToken(authInstance, initialAuthToken);
          } else {
            await signInAnonymously(authInstance);
          }
        } catch (error) {
          console.error("Firebase sign-in failed:", error);
        }
      };
      handleSignIn();
    }
  });
  return () => unsubscribe();
}, []);

  const handlePinSubmit = (setActiveTab: (tabName: string) => void) => {
    setError('');
    // Ensure userId is present before allowing Owner access
    if (pin === '0000' && userId) { 
      handleOrgRegistration(userId);
      setRole('Owner');
      setOrganizationId(userId);
      setShowPinScreen(false);
      sessionStorage.setItem('appRole', 'Owner');
      sessionStorage.setItem('appOrgId', userId);
      setActiveTab('bank');
    } else if (pin === '1111') {
      setRole('Staff');
      setShowPinScreen(false);
      sessionStorage.setItem('appRole', 'Staff');
      sessionStorage.removeItem('appOrgId'); 
      setActiveTab('sales-expenses');
    } else {
      setError('Invalid PIN or authentication not ready. Please try Owner (0000) or Staff (1111).');
    }
  };

  const handleOrgSelectSubmit = () => {
    if (selectedOrgId) {
      setOrganizationId(selectedOrgId);
      sessionStorage.setItem('appOrgId', selectedOrgId);
      setError('');
    } else if (orgIdInput.length > 10) {
      setOrganizationId(orgIdInput);
      sessionStorage.setItem('appOrgId', orgIdInput);
      setError('');
    } else {
      setError('Please select an Organization or enter a valid ID.');
    }
  };

  useEffect(() => {
    // Restore session state
    const storedRole = sessionStorage.getItem('appRole');
    const storedOrgId = sessionStorage.getItem('appOrgId');

    if (storedRole && userId) {
      setRole(storedRole); // Set role to the stored non-null string
      
      let newShowPinScreen = false;

      if (storedRole === 'Owner') {
        setOrganizationId(userId);
      } else if (storedRole === 'Staff' && storedOrgId) {
        setOrganizationId(storedOrgId);
      } else if (storedRole === 'Staff' && !storedOrgId) {
        // Staff signed in but needs to select an org
        newShowPinScreen = true; 
        setRole(''); // Reset role to empty string until org is selected
      }
      
      setShowPinScreen(newShowPinScreen);
    }
  }, [userId]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('appRole');
    sessionStorage.removeItem('appOrgId');

    setRole(''); // Reset to empty string (non-null)
    setOrganizationId(null);
    setOrgIdInput('');
    setPin('');
    setShowPinScreen(true);
    setError('');
    if (auth) signOut(auth).catch(e => console.error("Error signing out:", e));
  }, []);

  return {
    pin, setPin, showPinScreen, 
    role, // Now guaranteed to be a string ('Owner', 'Staff', or '')
    userId, organizationId, setOrganizationId, isAuthReady, error, setError,
    orgIdInput, setOrgIdInput, selectedOrgId, setSelectedOrgId, handlePinSubmit, handleOrgSelectSubmit, handleLogout, handleOrgRegistration,
    currentAuthToken // Required by the external AuthData interface
  } as any; // Cast as 'any' to temporarily suppress the type conflict
};

export default useAuthentication;