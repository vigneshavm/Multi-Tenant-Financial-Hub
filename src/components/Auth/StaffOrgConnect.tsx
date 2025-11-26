import React, { useState, type FormEvent } from 'react';

// --- Type Definitions ---

// Define the shape of the state object passed from the parent for initial setup
interface StaffOrgConnectState {
    userId: string;
    error: string | null;
    setError: (error: string | null) => void;
}

// Define the shape of the handler functions passed from the parent for initial setup
interface StaffOrgConnectHandlers {
    // organizationName, role, organizationId
    handleOrgConnect: (orgName: string | null, role: 'Owner' | 'Staff', orgId: string | null) => void;
}

// Define the shape of an Organization object for the selection list
interface Organization {
    id: string;
    name: string;
}

// Define the overall component props (now combining initial setup and selection mode props)
interface StaffOrgConnectProps {
    // REQUIRED for Initial Setup Mode
    handlers: StaffOrgConnectHandlers;
    state: StaffOrgConnectState;
    isAuthenticating: boolean;
    orgList?: Organization[];
    selectedOrgId?: string;
    setSelectedOrgId?: (id: string) => void;
    orgIdInput?: string;
    setOrgIdInput?: (input: string) => void;
    handleOrgSelectSubmit?: (e: FormEvent) => void;
    
    // Note: We will use state.error for display error, as it's cleaner.
}

// Component responsible for initial organization setup and role assignment (or selection)
const StaffOrgConnect: React.FC<StaffOrgConnectProps> = (props) => {
    // Destructure all props for clarity
    const { 
        handlers, 
        state, 
        isAuthenticating, 
        orgList, 
        selectedOrgId, 
        setSelectedOrgId, 
        orgIdInput, 
        setOrgIdInput, 
        handleOrgSelectSubmit 
    } = props;
    
    // Guard clause
    if (!state) return null;

    // Determine the rendering mode: Selection Mode takes precedence if orgList is provided.
    const isSelectionMode = !!orgList && orgList.length > 0;

    // --- State for Initial Setup Mode (Only used if NOT in Selection Mode) ---
    const [mode, setMode] = useState<'create' | 'join'>('create'); // 'create' or 'join'
    const [orgName, setOrgName] = useState<string>('');
    const [orgIdToJoin, setOrgIdToJoin] = useState<string>('');
    const [roleChoice, setRoleChoice] = useState<'Owner' | 'Staff'>('Owner');

    const isOwner: boolean = roleChoice === 'Owner';
    const isStaff: boolean = roleChoice === 'Staff';

    // --- Handlers for Initial Setup Mode ---

    const handleCreateSubmit = (e: FormEvent) => {
        e.preventDefault();
        state.setError(null);
        if (orgName.trim() && roleChoice) {
            handlers.handleOrgConnect(orgName.trim(), roleChoice, null);
        } else {
            state.setError("Please enter an organization name and select a role.");
        }
    };

    const handleJoinSubmit = (e: FormEvent) => {
        e.preventDefault();
        state.setError(null);
        if (orgIdToJoin.trim()) {
            handlers.handleOrgConnect(null, 'Staff', orgIdToJoin.trim());
        } else {
            state.setError("Please enter a valid Organization ID to join.");
        }
    };

    // --- RENDER LOGIC ---

    // Common UI Structure
    const commonHeader = (
        <>
            <h1 className="text-3xl font-extrabold text-gray-900 text-center">
                Welcome to the Financial Hub
            </h1>
            <p className="text-sm text-gray-500 text-center">
                User ID: <code className="text-indigo-600 font-mono text-xs">{state.userId}</code>
            </p>
            {state.error && (
                <div className="p-3 text-sm font-medium text-red-700 bg-red-50 border-l-4 border-red-500 rounded-lg" role="alert">
                    {state.error}
                </div>
            )}
        </>
    );

    // RENDER: Organization Selection UI (NEW)
    const renderSelectionMode = () => {
        // Guard against missing required selection props, although checking orgList is usually enough
        if (!orgList || !setSelectedOrgId || !handleOrgSelectSubmit) return null;

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">Select Your Organization</h2>
                <form onSubmit={handleOrgSelectSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        You are a staff member of multiple organizations. Please select the one you wish to access now.
                    </p>
                    
                    {/* Organization Dropdown */}
                    <div>
                        <label htmlFor="orgSelect" className="block text-sm font-medium text-gray-700">Choose Organization</label>
                        <select
                            id="orgSelect"
                            value={selectedOrgId || ''}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                            required
                        >
                            <option value="" disabled>Select an Organization</option>
                            {orgList.map(org => (
                                <option key={org.id} value={org.id}>
                                    {org.name} ({org.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isAuthenticating || !selectedOrgId}
                        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-lg disabled:bg-green-300"
                    >
                        {isAuthenticating ? 'Loading...' : 'Proceed to Dashboard'}
                    </button>
                </form>
            </div>
        );
    };

    // RENDER: Initial Setup UI (Original Logic)
    const renderInitialSetupMode = () => (
        <>
            {/* Mode Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                <button
                    onClick={() => setMode('create')}
                    className={`flex-1 p-3 rounded-xl font-semibold transition-colors ${mode === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    Create New Organization
                </button>
                <button
                    onClick={() => setMode('join')}
                    className={`flex-1 p-3 rounded-xl font-semibold transition-colors ${mode === 'join' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    Join Existing Organization
                </button>
            </div>

            {/* --- CREATE ORGANIZATION FORM --- */}
            {mode === 'create' && (
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Step 1: Define Organization</h2>
                    <div>
                        <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">Organization Name</label>
                        <input
                            type="text"
                            id="orgName"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            placeholder="Enter Name"
                            required
                        />
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Step 2: Select Your Role</h2>
                    <div className="flex gap-4">
                        <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-colors shadow ${isOwner ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                            <input 
                                type="radio" 
                                value="Owner" 
                                checked={isOwner} 
                                onChange={() => setRoleChoice('Owner')} 
                                className="hidden" 
                            />
                            <span className="block font-bold text-lg text-gray-900">Owner</span>
                            <span className="block text-sm text-gray-500">Full access & financial control.</span>
                        </label>
                        <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-colors shadow ${isStaff ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                            <input 
                                type="radio" 
                                value="Staff" 
                                checked={isStaff} 
                                onChange={() => setRoleChoice('Staff')} 
                                className="hidden" 
                            />
                            <span className="block font-bold text-lg text-gray-900">Staff</span>
                            <span className="block text-sm text-gray-500">Entry-level access for logging.</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg disabled:bg-indigo-400"
                    >
                        {isAuthenticating ? 'Creating...' : `Create & Start as ${roleChoice}`}
                    </button>
                </form>
            )}

            {/* --- JOIN ORGANIZATION FORM --- */}
            {mode === 'join' && (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="orgId" className="block text-sm font-medium text-gray-700">Organization ID (Provided by Owner)</label>
                        <input
                            type="text"
                            id="orgId"
                            value={orgIdToJoin}
                            onChange={(e) => setOrgIdToJoin(e.target.value)}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            placeholder="Paste ID here (e.g., K9j2Lp)"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">You will join as Staff with data entry privileges.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-lg disabled:bg-green-300"
                    >
                        {isAuthenticating ? 'Connecting...' : 'Join Organization as Staff'}
                    </button>
                </form>
            )}
        </>
    );
    
    return (
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-2xl space-y-6">
            {commonHeader}
            {isSelectionMode ? renderSelectionMode() : renderInitialSetupMode()}
        </div>
    );
};

export default StaffOrgConnect;