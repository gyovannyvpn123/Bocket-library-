import { 
    AuthenticationState, 
    AuthenticationCreds, 
    SignalKeyStoreType 
} from '../Types';
import { initAuthCreds } from '../Utils';

/**
 * Interface for authentication state management
 */
export interface AuthStateManager {
    /**
     * Get current authentication credentials
     */
    getAuthCredentials: () => AuthenticationCreds;
    
    /**
     * Save updated authentication credentials
     */
    saveAuthCredentials: (creds: Partial<AuthenticationCreds>) => void;
    
    /**
     * Get current key store
     */
    getKeyStore: () => SignalKeyStoreType;
    
    /**
     * Save updated key store
     */
    saveKeyStore: (keyStore: Partial<SignalKeyStoreType>) => void;
    
    /**
     * Get full authentication state
     */
    getAuthState: () => AuthenticationState;
    
    /**
     * Clear authentication state
     */
    clearAuthState: () => void;
}

/**
 * Create an in-memory authentication state manager
 * @param initialAuthState Initial authentication state
 * @returns Authentication state manager
 */
export const createAuthStateManager = (
    initialAuthState?: AuthenticationState
): AuthStateManager => {
    // Initialize authentication state
    let authState: AuthenticationState = initialAuthState ?? {
        creds: initAuthCreds(),
        keys: {
            preKeys: {},
            sessions: {},
            senderKeys: {},
            appStateSyncKeys: {},
            appStateVersions: {}
        }
    };
    
    return {
        getAuthCredentials: () => authState.creds,
        
        saveAuthCredentials: (creds) => {
            authState.creds = {
                ...authState.creds,
                ...creds
            };
        },
        
        getKeyStore: () => authState.keys,
        
        saveKeyStore: (keyStore) => {
            authState.keys = {
                ...authState.keys,
                ...keyStore
            };
        },
        
        getAuthState: () => authState,
        
        clearAuthState: () => {
            authState = {
                creds: initAuthCreds(),
                keys: {
                    preKeys: {},
                    sessions: {},
                    senderKeys: {},
                    appStateSyncKeys: {},
                    appStateVersions: {}
                }
            };
        }
    };
};

/**
 * Create a file-based authentication state manager
 * This would save authentication state to a file for persistence
 * @param path Path to save state file
 * @returns Authentication state manager
 */
export const createFileAuthStateManager = (
    path: string
): AuthStateManager => {
    // In a real implementation, this would load/save state from/to a file
    // For now, we'll just use the in-memory manager
    return createAuthStateManager();
};

export * from './auth-state';
