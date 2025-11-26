import React, { useState, useEffect } from 'react';
// Import the actual types for Firestore operations
import { Firestore, doc, updateDoc } from 'firebase/firestore';

// Assuming these are defined in your utility file and potentially null
import { db, appId } from '../../utils/firebase'; 

// --- TYPE DEFINITIONS ---

type UserRole = 'Owner' | 'Staff' | 'Guest' | string;
type ActiveTab = 'sales-expenses' | 'cheques-purchase-entry' | 'purchase-history' | 'bank' | string;

interface HeaderProps {
    role: UserRole;
    organizationId: string | null;
    currentOrgName: string;
    handleLogout: () => void;
    error: string | null;
    activeTab: ActiveTab;
    setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
}

interface NavItem {
    id: ActiveTab;
    label: string;
    ownerOnly?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    role, 
    organizationId, 
    currentOrgName, 
    handleLogout, 
    error, 
    activeTab, 
    setActiveTab, 
    setError 
}) => {
    
    // State management for organization name editing (Owner only)
    const [isEditingOrgName, setIsEditingOrgName] = useState<boolean>(false);
    const [newOrgName, setNewOrgName] = useState<string>(currentOrgName);

    useEffect(() => {
        setNewOrgName(currentOrgName);
    }, [currentOrgName]);

    const handleSaveOrgName = async () => {
        // Ensure Firestore instance exists, user has permission, and name is not empty
        if (!organizationId || !db || role !== 'Owner' || !newOrgName.trim()) {
            if (role === 'Owner') setError("Organization name cannot be empty.");
            return;
        }

        try {
            // Cast db to Firestore since we checked for its existence
            const database = db as Firestore;
            const orgDocRef = doc(database, `artifacts/${appId}/public/data/organizations`, organizationId);
            
            await updateDoc(orgDocRef, { name: newOrgName.trim() });
            
            // Note: This relies on the parent component's state update (e.g., in useDataFetching) 
            // to propagate the new name back to currentOrgName
            setIsEditingOrgName(false);
            setError(null); 
        } catch (e) { 
            console.error("Error saving organization name:", e); 
            setError("Failed to save organization name."); 
        }
    };
    
    const navItems: NavItem[] = [
        { id: 'sales-expenses', label: 'Sales & Expenses Entry' },
        { id: 'cheques-purchase-entry', label: 'Cheques & Purchase Entry' },
        { id: 'purchase-history', label: 'Bill Due Monitoring' },
        { id: 'bank', label: 'Financial Dashboard', ownerOnly: true },
    ];
    
    // Filter navigation items based on user role
    const filteredNavItems = navItems.filter(item => !item.ownerOnly || role === 'Owner');

    return (
        <header className="mb-6 bg-white rounded-xl shadow-md">
            <div className="p-4 border-b flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Textile Business Financial Hub</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Logged in as: <span className="font-semibold text-indigo-600">{role}</span> 
                        {organizationId && (
                            <span className='ml-4'>
                                | Organization: 
                                {role === 'Owner' ? (
                                    isEditingOrgName ? (
                                        <span className="inline-flex items-center gap-1 ml-2">
                                            <input 
                                                type="text" 
                                                value={newOrgName} 
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOrgName(e.target.value)} 
                                                className="bg-gray-100 p-1 rounded text-sm border border-indigo-300 w-40" 
                                                placeholder="Enter Name" 
                                            />
                                            <button onClick={handleSaveOrgName} className="text-green-600 hover:text-green-800" title="Save">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            </button>
                                            <button onClick={() => {setIsEditingOrgName(false); setNewOrgName(currentOrgName);}} className="text-red-500 hover:text-red-700" title="Cancel">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            </button>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 ml-2">
                                            <code className="bg-gray-200 p-1 rounded text-sm font-semibold">{currentOrgName}</code>
                                            <button onClick={() => setIsEditingOrgName(true)} className="text-indigo-600 hover:text-indigo-800" title="Edit Name">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-5.464 5.464a1 1 0 000 1.414l7 7A1 1 0 0017 17v-4.586l-7-7z" /></svg>
                                            </button>
                                            <span className="text-xs text-gray-400">({organizationId.substring(0,6)}...)</span>
                                        </span>
                                    )
                                ) : (
                                    <code className="bg-gray-200 p-1 rounded text-xs font-semibold">{currentOrgName}</code>
                                )}
                            </span>
                        )}
                    </p>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                {organizationId && (
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md text-sm whitespace-nowrap">
                        Logout
                    </button>
                )}
            </div>
            
            {/* Navigation Tabs */}
            <nav className="flex flex-wrap gap-1 p-2">
                {filteredNavItems.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveTab(item.id)} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
        </header>
    );
};

export default Header;