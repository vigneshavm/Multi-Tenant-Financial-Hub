import { useState, useEffect, useCallback } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db, appId } from '../utils/firebase';

const useAuthentication = () => {
    const [pin, setPin] = useState('');
    const [showPinScreen, setShowPinScreen] = useState(true);
    const [role, setRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [organizationId, setOrganizationId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [error, setError] = useState('');
    const [orgIdInput, setOrgIdInput] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState('');

    const handleOrgRegistration = useCallback(async (ownerId) => {
        if (!db) return;
        const orgDocRef = doc(db, `artifacts/${appId}/public/data/organizations`, ownerId);
        try {
            const defaultName = `Org - ${ownerId.substring(0, 6)}...`;
            const orgData = { ownerId: ownerId, name: defaultName, registeredAt: serverTimestamp() };
            await setDoc(orgDocRef, orgData, { merge: true });
        } catch (e) { console.error("Error registering organization:", e); }
    }, []);

    useEffect(() => {
        // Authentication Listener
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                setIsAuthReady(true);
            } else {
                // Initial sign-in logic (uses global initialAuthToken, assumed to be imported)
                const initialAuthToken = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;
                const handleSignIn = async () => {
                    try {
                        if (initialAuthToken) await signInWithCustomToken(auth, initialAuthToken);
                        else await signInAnonymously(auth);
                    } catch (error) { console.error("Firebase sign-in failed:", error); }
                };
                handleSignIn();
            }
        });
        return () => unsubscribe();
    }, []);

    const handlePinSubmit = (setActiveTab) => {
        setError('');
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
        const storedRole = sessionStorage.getItem('appRole');
        const storedOrgId = sessionStorage.getItem('appOrgId');
        
        if (storedRole && userId) {
            setRole(storedRole);
            if (storedRole === 'Owner') {
                setOrganizationId(userId);
                setShowPinScreen(false);
            } else if (storedRole === 'Staff' && storedOrgId) {
                setOrganizationId(storedOrgId);
                setShowPinScreen(false);
            } else {
                setShowPinScreen(false);
            }
        }
    }, [userId]);

    const handleLogout = useCallback(() => {
        sessionStorage.removeItem('appRole');
        sessionStorage.removeItem('appOrgId');

        setRole(null);
        setOrganizationId(null);
        setOrgIdInput('');
        setPin('');
        setShowPinScreen(true);
        setError('');
        if (auth) signOut(auth).catch(e => console.error("Error signing out:", e));
    }, []);

    return { 
        pin, setPin, showPinScreen, role, userId, organizationId, setOrganizationId, isAuthReady, error, setError,
        orgIdInput, setOrgIdInput, selectedOrgId, setSelectedOrgId, handlePinSubmit, handleOrgSelectSubmit, handleLogout, handleOrgRegistration
    };
};

export default useAuthentication;
