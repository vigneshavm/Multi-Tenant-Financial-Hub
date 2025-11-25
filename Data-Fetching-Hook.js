import { useState, useEffect } from 'react';
import { onSnapshot, collection, query, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId, getCollectionPath } from '../utils/firebase';

const useDataFetching = (isAuthReady, organizationId, role) => {
    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [cheques, setCheques] = useState([]);
    const [bankBalance, setBankBalance] = useState(0);
    const [orgList, setOrgList] = useState([]);
    const [currentOrgName, setCurrentOrgName] = useState('');

    useEffect(() => {
        if (!isAuthReady || !db) return;
        
        // 1. Fetch Organization List (Global Public)
        const orgListPath = `artifacts/${appId}/public/data/organizations`;
        const unsubscribeOrgList = onSnapshot(collection(db, orgListPath), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrgList(list);
        }, (error) => {
            console.error("Error fetching organization list:", error);
        });

        if (!organizationId) return () => unsubscribeOrgList();
        
        // 2. Fetch Transaction Data (Tenant Private)
        const setupSnapshot = (collectionName, setState) => {
            const path = getCollectionPath(organizationId, collectionName);
            if (!path) return () => {};

            const q = query(collection(db, path));
            return onSnapshot(q, (snapshot) => {
                const list = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const date = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString();
                    return { id: doc.id, ...data, date, dateLogged: data.dateLogged || date };
                });
                setState(list);
            }, (error) => { console.error(`Error fetching ${collectionName}:`, error); });
        };

        const unsubscribeSales = setupSnapshot('sales', setSales);
        const unsubscribeExpenses = setupSnapshot('expenses', setExpenses);
        const unsubscribePurchases = setupSnapshot('purchases', setPurchases);
        const unsubscribeCheques = setupSnapshot('cheques', setCheques);

        // Fetch Bank Balance
        const bankDocRef = doc(db, getCollectionPath(organizationId, 'bank'), 'balance');
        const unsubscribeBank = onSnapshot(bankDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setBankBalance(docSnap.data().amount || 0);
            } else {
                setBankBalance(0);
                if (role === 'Owner') {
                    setDoc(bankDocRef, { amount: 0, lastUpdated: serverTimestamp() }, { merge: true }).catch(e => console.error("Error setting initial balance:", e));
                }
            }
        }, (error) => { console.error("Error fetching bank balance:", error); });

        return () => {
            unsubscribeOrgList();
            unsubscribeSales();
            unsubscribeExpenses();
            unsubscribePurchases();
            unsubscribeCheques();
            unsubscribeBank();
        };

    }, [isAuthReady, organizationId, role]);

    // Update current org name based on list
    useEffect(() => {
        if (organizationId && orgList.length > 0) {
            const org = orgList.find(o => o.ownerId === organizationId);
            if (org) setCurrentOrgName(org.name);
        }
    }, [organizationId, orgList]);

    return { sales, expenses, purchases, cheques, bankBalance, orgList, currentOrgName, setCurrentOrgName };
};

export default useDataFetching;
