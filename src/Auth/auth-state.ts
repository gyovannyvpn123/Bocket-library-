import * as fs from 'fs';
import * as path from 'path';
import { AuthenticationState } from '../Types';
import { initAuthCreds } from '../Utils';

/**
 * Save authentication state to a file
 * @param state Authentication state to save
 * @param filePath Path to save to
 */
export const saveAuthStateToFile = (
    state: AuthenticationState,
    filePath: string
): void => {
    try {
        // Create directory if it doesn't exist
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Convert binary data to base64 strings for JSON serialization
        const serializedState = serialize(state);
        
        // Write to file
        fs.writeFileSync(
            filePath,
            JSON.stringify(serializedState, null, 2)
        );
    } catch (error) {
        console.error('Failed to save auth state:', error);
    }
};

/**
 * Load authentication state from a file
 * @param filePath Path to load from
 * @returns Authentication state
 */
export const loadAuthStateFromFile = (
    filePath: string
): AuthenticationState => {
    try {
        if (!fs.existsSync(filePath)) {
            // Return default state if file doesn't exist
            return {
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
        
        // Read and parse file
        const data = fs.readFileSync(filePath, 'utf8');
        const serializedState = JSON.parse(data);
        
        // Convert base64 strings back to binary data
        return deserialize(serializedState);
    } catch (error) {
        console.error('Failed to load auth state:', error);
        
        // Return default state on error
        return {
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

/**
 * Convert binary data in authentication state to base64 strings for serialization
 * @param state Authentication state
 * @returns Serialized state
 */
const serialize = (state: AuthenticationState): any => {
    const { creds, keys } = state;
    
    // Helper to convert Uint8Array/Buffer to base64 string
    const toBase64 = (data: Uint8Array | Buffer | undefined): string | undefined => {
        if (!data) return undefined;
        return Buffer.from(data).toString('base64');
    };
    
    // Convert credential binary data
    const serializedCreds = {
        ...creds,
        noiseKey: {
            private: toBase64(creds.noiseKey.private),
            public: toBase64(creds.noiseKey.public)
        },
        signedIdentityKey: {
            private: toBase64(creds.signedIdentityKey.private),
            public: toBase64(creds.signedIdentityKey.public)
        },
        signedPreKey: {
            keyId: creds.signedPreKey.keyId,
            private: toBase64(creds.signedPreKey.private),
            public: toBase64(creds.signedPreKey.public),
            signature: toBase64(creds.signedPreKey.signature)
        }
    };
    
    // Convert key store binary data
    // This is simplified - a real implementation would need to recursively process
    // all binary data in the complex key store structure
    const serializedKeys = { ...keys };
    
    return {
        creds: serializedCreds,
        keys: serializedKeys
    };
};

/**
 * Convert serialized base64 strings back to binary data for authentication state
 * @param serialized Serialized state
 * @returns Authentication state
 */
const deserialize = (serialized: any): AuthenticationState => {
    const { creds, keys } = serialized;
    
    // Helper to convert base64 string to Uint8Array
    const fromBase64 = (data: string | undefined): Uint8Array | undefined => {
        if (!data) return undefined;
        return new Uint8Array(Buffer.from(data, 'base64'));
    };
    
    // Convert credential binary data
    const deserializedCreds = {
        ...creds,
        noiseKey: {
            private: fromBase64(creds.noiseKey.private),
            public: fromBase64(creds.noiseKey.public)
        },
        signedIdentityKey: {
            private: fromBase64(creds.signedIdentityKey.private),
            public: fromBase64(creds.signedIdentityKey.public)
        },
        signedPreKey: {
            keyId: creds.signedPreKey.keyId,
            private: fromBase64(creds.signedPreKey.private),
            public: fromBase64(creds.signedPreKey.public),
            signature: fromBase64(creds.signedPreKey.signature)
        }
    };
    
    // Convert key store binary data
    // This is simplified - a real implementation would need to recursively process
    // all binary data in the complex key store structure
    const deserializedKeys = { ...keys };
    
    return {
        creds: deserializedCreds,
        keys: deserializedKeys
    };
};

/**
 * Create authentication state handlers for easy use
 * @param options Options for state management
 * @returns Functions to manage authentication state
 */
export const useAuthState = (
    options: {
        saveState?: (state: AuthenticationState) => void;
        restoreState?: () => AuthenticationState | Promise<AuthenticationState>;
    } = {}
) => {
    let authState: AuthenticationState = {
        creds: initAuthCreds(),
        keys: {
            preKeys: {},
            sessions: {},
            senderKeys: {},
            appStateSyncKeys: {},
            appStateVersions: {}
        }
    };
    
    const saveState = options.saveState ?? (() => {});
    const restoreState = options.restoreState ?? (() => authState);
    
    const updateState = (update: Partial<AuthenticationState>) => {
        authState = {
            ...authState,
            ...update,
            creds: {
                ...authState.creds,
                ...(update.creds || {})
            },
            keys: {
                ...authState.keys,
                ...(update.keys || {})
            }
        };
        
        saveState(authState);
    };
    
    return {
        state: authState,
        
        /**
         * Save updated state
         */
        saveState: updateState,
        
        /**
         * Restore previously saved state
         */
        restoreState: async () => {
            const result = await restoreState();
            if (result) {
                authState = result;
                return true;
            }
            return false;
        },
        
        /**
         * Bind state to a Bocket instance
         * @param bocket Bocket instance
         */
        bind: (bocket: any) => {
            bocket.on('auth', (newAuthState: AuthenticationState) => {
                updateState(newAuthState);
            });
        }
    };
};
