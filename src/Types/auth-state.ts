import { AuthenticationState } from './index';

/**
 * Handle for authentication state storage functions
 */
export interface AuthStateHandler {
    /**
     * Get current authentication state
     */
    getState: () => AuthenticationState | undefined;
    
    /**
     * Save updated authentication state
     */
    saveState: (state: AuthenticationState) => void;
    
    /**
     * Clear authentication state (for logout)
     */
    clearState: () => void;
}

/**
 * Result of useAuthState hook
 */
export interface AuthStateResult {
    /**
     * Current authentication state
     */
    state: AuthenticationState | undefined;
    
    /**
     * Function to save updated state
     */
    saveState: (state: AuthenticationState) => void;
    
    /**
     * Function to clear state on logout
     */
    clearState: () => void;
}