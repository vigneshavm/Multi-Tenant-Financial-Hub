import { useCallback } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, getCollectionPath } from '../utils/firebase';

const useDataHandlers = ({ organizationId, role, setError }) => {
    
    /**
     * Generic function to add a new document to a specified collection.
     */
    const handleAdd = useCallback(async (collectionName, data) => {
        if (!organizationId || !db) return;
        try {
            const path = getCollectionPath(organizationId, collectionName);
            await addDoc(collection(db, path), { ...data, timestamp: serverTimestamp() });
            setError('');
        } catch (e) {
            console.error(`Error adding ${collectionName}:`, e);
            setError(`Failed to add entry to ${collectionName}.`);
        }
    }, [organizationId, setError]);

    /**
     * Handles deleting a document. Restricted to Owner role.
     */
    const handleDelete = useCallback(async (collectionName, id) => {
        if (!organizationId || !db || role !== 'Owner') return;
        
        // NOTE: In a real app, replace window.confirm with a custom modal UI.
        if (!window.confirm(`Are you sure you want to delete this ${collectionName.slice(0, -1)} entry?`)) return;
        
        try {
            const path = getCollectionPath(organizationId, collectionName);
            await deleteDoc(doc(db, path, id));
        } catch (e) {
            console.error(`Error deleting ${collectionName}:`, e);
            setError(`Failed to delete entry from ${collectionName}.`);
        }
    }, [organizationId, role, setError]);

    /**
     * Generic function to update a document's fields (used for status updates).
     * Restricted to Owner role.
     */
    const updateDocStatus = useCallback(async (collectionName, id, updates) => {
        if (!organizationId || !db || role !== 'Owner') return;
        try {
            const path = getCollectionPath(organizationId, collectionName);
            await updateDoc(doc(db, path, id), updates);
        } catch (e) { console.error(`Error updating ${collectionName} status:`, e); }
    }, [organizationId, role]);

    const updatePurchaseStatus = (id, newStatus) => updateDocStatus('purchases', id, { status: newStatus });
    const updateChequeStatus = (id, newStatus) => updateDocStatus('cheques', id, { status: newStatus });

    /**
     * Handles manual update of the bank balance document. Restricted to Owner role.
     */
    const handleBankBalanceUpdate = async (bankUpdate, setBankUpdate) => {
        if (!organizationId || !db || role !== 'Owner') return;
        const newBalance = parseFloat(bankUpdate);
        if (isNaN(newBalance)) { setError('Invalid bank balance amount.'); return; }
        try {
            const bankDocRef = doc(db, getCollectionPath(organizationId, 'bank'), 'balance');
            await setDoc(bankDocRef, { amount: newBalance, lastUpdated: serverTimestamp() }, { merge: true });
            setBankUpdate('');
            setError('');
        } catch (e) { console.error("Error updating bank balance:", e); setError('Failed to update bank balance.'); }
    };

    return { 
        handleAdd, handleDelete, 
        updatePurchaseStatus, updateChequeStatus, 
        handleBankBalanceUpdate
    };
};

export default useDataHandlers;