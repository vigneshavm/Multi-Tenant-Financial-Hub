import React, { useState, useEffect, type JSX, type FormEvent } from 'react'; // Import FormEvent
import useAuthentication from './hooks/useAuth';
import useDataFetching from './hooks/useData';
import useDataCalculations from './hooks/useCalculations';
import useDataHandlers from './hooks/useHandlers';

// Firebase imports needed for updateDoc
import { doc, updateDoc, Firestore } from 'firebase/firestore';

// Import components and utilities
import DateFilter from './components/Layout/DateFilter';
import SalesAndExpensesEntry from './components/Pages/SalesAndExpensesEntry';
import ChequesAndPurchaseEntry from './components/Pages/ChequesAndPurchaseEntry';
import PurchaseHistory from './components/Pages/PurchaseHistory';
import BankFinancialHistory from './components/Pages/BankFinancialHistory'; // Import Cheque type
import PinScreen from './components/Auth/PinScreen';
import StaffOrgConnect from './components/Auth/StaffOrgConnect';
import { db, appId } from './utils/firebase';

// --- TYPE DEFINITIONS ---
// (Your type definitions remain unchanged)
type UserRole = 'Owner' | 'Staff' | 'Guest' | string;
export interface Transaction { 
    id: string;
    dateLogged: string;
    amount: number;
    [key: string]: any;
}
export interface Sale extends Transaction { total: number; }
export interface Expense extends Transaction { }
// FIX: Update TransactionItem to be compatible with Cheque
interface TransactionItem { id: string; description: string; type?: string; amount?: number; date?: string; status?: string; [key: string]: any; }
type GroupedData = [string, TransactionItem[]][];
export interface Purchase extends Transaction {
    paymentDueDate: string;
    expectedPaymentDate: string;
    status: 'Pending' | 'Paid' | 'Over Due' | string; 
}
interface FetchedData {
    sales: Sale[];
    expenses: Expense[];
    purchases: Purchase[];
    cheques: TransactionItem[];
    bankBalance: number;
    orgList: any;
    currentOrgName: string;
    setCurrentOrgName: React.Dispatch<React.SetStateAction<string>>;
}
interface AuthData {
    pin: string;
    setPin: React.Dispatch<React.SetStateAction<string>>;
    showPinScreen: boolean;
    role: UserRole;
    userId: string | null;
    organizationId: string | null;
    setOrganizationId: React.Dispatch<React.SetStateAction<string | null>>;
    isAuthReady: boolean;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    orgIdInput: string;
    setOrgIdInput: React.Dispatch<React.SetStateAction<string>>;
    selectedOrgId: string;
    setSelectedOrgId: React.Dispatch<React.SetStateAction<string>>;
    handlePinSubmit: (defaultTab: string) => Promise<void>;
    handleOrgSelectSubmit: (orgId: string) => Promise<void>;
    handleLogout: () => void;
    currentAuthToken: string | null;
    handleOrgRegistration: () => Promise<void>;
}
interface AppState {
    role: UserRole;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    organizationId: string | null;
    currentOrgName: string;
    userId: string | null;
}
interface NavItem {
    id: string;
    label: string;
    ownerOnly?: boolean;
}


const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('bank');
    
    // 1. Authentication and State Hook
    const auth: AuthData = useAuthentication();
    const {
        pin, setPin, showPinScreen, role, userId, organizationId, setOrganizationId, isAuthReady, error, setError,
        orgIdInput, setOrgIdInput, selectedOrgId, setSelectedOrgId,
        handlePinSubmit, handleOrgSelectSubmit, handleLogout, currentAuthToken, handleOrgRegistration
    } = auth;

    // 2. Data Fetching Hook
    const dataFetched: FetchedData = useDataFetching(isAuthReady, organizationId, role);
    const { sales, expenses, purchases, cheques, bankBalance, orgList, currentOrgName, setCurrentOrgName } = dataFetched;
    const typedOrgList = orgList as any[] | null;
    // FIX: Cast cheques to Cheque[]
    const typedCheques = cheques as unknown as any[];

    // 3. Calculation Hook
    const calculations: any = useDataCalculations(sales, expenses, purchases);
    
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    // Org Name Management State
    const [isEditingOrgName, setIsEditingOrgName] = useState<boolean>(false);
    const [newOrgName, setNewOrgName] = useState<string>(currentOrgName);

    useEffect(() => {
        setNewOrgName(currentOrgName);
    }, [currentOrgName]);

    const handleSaveOrgName = async () => {
        if (!organizationId || !db || role !== 'Owner' || !newOrgName.trim()) {
            if (role !== 'Owner') setError("Only the Owner can edit the organization name.");
            return;
        }
        
        try {
            const database = db as Firestore;
            const orgDocRef = doc(database, `artifacts/${appId}/public/data/organizations`, organizationId);
            await updateDoc(orgDocRef, { name: newOrgName.trim() });
            setCurrentOrgName(newOrgName.trim());
            setIsEditingOrgName(false);
            setError(null);
        } catch (e) { 
            console.error("Error saving organization name:", e); 
            setError("Failed to save organization name."); 
        }
    };
    
    // 4. Data Handler Provider
    const handlers: any = useDataHandlers({ organizationId, role, setError });

    // Bundle state for cleaner props
    const state: AppState = { role, setError, organizationId, currentOrgName, userId };

    // FIX: Create a wrapper function to handle the form submission event
    const onOrgSelectFormSubmit = async (e: FormEvent) => {
        e.preventDefault(); // Prevent default form submission
        if (selectedOrgId) {
            setIsAuthenticating(true);
            await handleOrgSelectSubmit(selectedOrgId);
            setIsAuthenticating(false);
        }
    };


    // --- Conditional Content Rendering ---
    const renderContent = (): JSX.Element => {
        if (!organizationId) {
            // FIX: Use typedOrgList and provide ALL required props, including the 'mode' discriminant.
            if (role === 'Staff' && typedOrgList && typedOrgList.length > 0) {
                return (
                    <StaffOrgConnect
                        // 1. Common Props (Required)
                        mode="selection" // The discriminant prop is CRITICAL here
                        userId={userId || ''}
                        isAuthenticating={isAuthenticating}
                        error={error}
                        // 2. Selection Mode Props
                        orgList={typedOrgList}
                        selectedOrgId={selectedOrgId}
                        setSelectedOrgId={setSelectedOrgId}
                        handleOrgSelectSubmit={onOrgSelectFormSubmit} // Use the wrapper function
                    />
                );
            }
            // NOTE: You will add the 'setup' mode block here later when you implement that flow.
            return <p className='text-center text-gray-600'>Loading authentication...</p>;
        }
        
        switch (activeTab) {
            case 'sales-expenses': return <SalesAndExpensesEntry handlers={handlers} state={state} calculations={calculations} />;
            case 'cheques-purchase-entry': return <ChequesAndPurchaseEntry handlers={handlers} state={state} />;
            case 'purchase-history': return <PurchaseHistory handlers={handlers} state={state} calculations={calculations} />;
            case 'bank': default: return <BankFinancialHistory handlers={handlers} state={state} data={{sales, expenses, purchases, cheques: typedCheques, bankBalance}} calculations={calculations} />;
        }
    };
    
    // --- Initial Pin Screen ---
    if (showPinScreen || !isAuthReady) {
        return (
            <PinScreen 
                pin={pin} 
                setPin={setPin} 
                handlePinSubmit={handlePinSubmit}
                error={error}
                activeTab={activeTab}
                isAuthenticating={isAuthenticating}
            />
        );
    }
    
    // --- Main App Layout ---
    const navItems: NavItem[] = [
        { id: 'sales-expenses', label: 'Sales & Expenses Entry' },
        { id: 'cheques-purchase-entry', label: 'Cheques & Purchase Entry' },
        { id: 'purchase-history', label: 'Bill Due Monitoring' },
        { id: 'bank', label: 'Financial Dashboard', ownerOnly: true },
    ];
    
    const filteredNavItems = navItems.filter(item => !item.ownerOnly || role === 'Owner');

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
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
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
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

            <DateFilter calculations={calculations} />

            <main className="pb-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;