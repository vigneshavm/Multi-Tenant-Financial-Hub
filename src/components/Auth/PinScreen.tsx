import React, { type FormEvent, type ChangeEvent } from 'react';

// --- Type Definitions (Revised to match the calling component's props) ---

// Define the overall component props
interface PinScreenProps {
  // State/Setters managed by the parent
  pin: string;
  setPin: (pin: string) => void; // Using a generic setter type for the pin state

  // Core Handlers
  handlePinSubmit: (activeTab: string) => Promise<void>;

  // Required context from the Parent
  activeTab: string;

  // Error state and authentication/loading state
  error: string | null;
  isAuthenticating: boolean;

  // New optional props to allow for Setup/Verify modes from the parent
  isSetupMode?: boolean;
  confirmPin?: string;
  setConfirmPin?: (pin: string) => void;
}

// Component responsible for setting a PIN or verifying an existing PIN
const PinScreen: React.FC<PinScreenProps> = (props) => {
  const {
    pin,
    setPin,
    handlePinSubmit,
    activeTab,
    error,
    isAuthenticating,
    isSetupMode = false, // Default to false if not provided
    confirmPin,
    setConfirmPin,
  } = props;

  // Determine titles and texts based on the isSetupMode prop
  const title: string = isSetupMode ? 'Set Your Access PIN' : 'Enter Your Access PIN';
  const buttonText: string = isSetupMode ? 'Set PIN & Continue' : 'Verify PIN';

  // Helper to limit input to 4 digits and numeric
  const handlePinChange = (e: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setter(value.slice(0, 4));
  };

  // Handles the submission logic
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // NOTE: Error setting must be handled by the PARENT COMPONENT now,
    // as we no longer have access to an `setError` handler.

    if (pin.length !== 4) {
      // Parent component will see the error prop update when the handler fails
      return;
    }

    if (isSetupMode) {
      if (pin !== confirmPin) {
        // Parent component is expected to handle the error display
        return;
      }
    }

    // Use the handler from props, passing the activeTab
    handlePinSubmit(activeTab);
  };

  // Determine button disabled state
  const isButtonDisabled =
    isAuthenticating || pin.length !== 4 || (isSetupMode && pin !== confirmPin);

  return (
    <div className="max-w-sm w-full mx-auto p-8 bg-white rounded-2xl shadow-2xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 text-center">{title}</h1>
      <p className="text-sm text-gray-500 text-center">
        Access for mode: <span className="font-semibold text-indigo-600">{activeTab}</span>
      </p>

      {error && (
        <div
          className="p-3 text-sm font-medium text-red-700 bg-red-50 border-l-4 border-red-500 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PIN Input */}
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
            Access PIN (4 digits)
          </label>
          <input
            type="password"
            id="pin"
            value={pin}
            onChange={(e) => handlePinChange(e, setPin)}
            maxLength={4}
            className="w-full mt-1 p-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-mono"
            placeholder="••••"
            required
            inputMode="numeric"
          />
        </div>

        {/* Confirm PIN Input (only for setup mode) */}
        {isSetupMode && (
          <div>
            <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700">
              Confirm PIN
            </label>
            <input
              type="password"
              id="confirmPin"
              value={confirmPin || ''}
              onChange={(e) => setConfirmPin && handlePinChange(e, setConfirmPin)}
              maxLength={4}
              className="w-full mt-1 p-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-mono"
              placeholder="••••"
              required
              inputMode="numeric"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg disabled:bg-indigo-300"
        >
          {isAuthenticating ? 'Processing...' : buttonText}
        </button>
      </form>
    </div>
  );
};

export default PinScreen;