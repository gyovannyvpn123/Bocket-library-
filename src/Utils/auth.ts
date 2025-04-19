import * as crypto from 'crypto';
import { KeyPair, SignedKeyPair, AuthenticationCreds } from '../Types';

/**
 * Generate a random bytes buffer of specified length
 * @param length Length of random bytes
 * @returns Random bytes as Buffer
 */
export const randomBytes = (length: number): Buffer => {
    return crypto.randomBytes(length);
};

/**
 * Generate a key pair for encryption
 * @returns Generated key pair
 */
export const generateKeyPair = (): KeyPair => {
    // This is a simplified implementation
    // In a real implementation, we would use proper curve25519 keys
    const privateKey = randomBytes(32);
    // Derive public key from private (simplified)
    const publicKey = crypto.createHash('sha256').update(privateKey).digest();
    
    return {
        private: privateKey,
        public: publicKey
    };
};

/**
 * Sign a key pair
 * @param keyPair Key pair to sign
 * @param keyId Key ID to use
 * @param signatureKey Key to sign with
 * @returns Signed key pair
 */
export const signKeyPair = (
    keyPair: KeyPair,
    keyId: number,
    signatureKey: Uint8Array
): SignedKeyPair => {
    // In a real implementation, we would properly sign the public key
    // This is a simplified version
    const signature = crypto.createHmac('sha256', Buffer.from(signatureKey))
        .update(Buffer.from(keyPair.public))
        .digest();
    
    return {
        keyId,
        ...keyPair,
        signature
    };
};

/**
 * Generate registration ID for the client
 * @returns Registration ID
 */
export const generateRegistrationId = (): number => {
    // Registration IDs are unsigned integers between 1 and 16380
    return Math.floor(Math.random() * 16379) + 1;
};

/**
 * Create initial authentication credentials
 * @returns Initial authentication credentials
 */
export const initAuthCreds = (): AuthenticationCreds => {
    const noiseKey = generateKeyPair();
    const signedIdentityKey = generateKeyPair();
    
    const registrationId = generateRegistrationId();
    const advSecretKey = randomBytes(32).toString('base64');
    
    const signedPreKey = signKeyPair(
        generateKeyPair(),
        Math.floor(Math.random() * 100000),
        signedIdentityKey.private
    );
    
    // Generate a random device ID
    const deviceId = randomBytes(16).toString('hex');
    
    return {
        noiseKey,
        signedIdentityKey,
        signedPreKey,
        registrationId,
        advSecretKey,
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        serverHasPreKeys: false,
        account: {},
        me: { id: '', name: '' },
        signalIdentities: [],
        lastAccountSyncTimestamp: 0,
        myAppStateKeyId: undefined,
        processedHistoryMessages: [],
        accountSettings: {},
        // Add new fields for WhatsApp Web authentication
        deviceId,
        clientToken: undefined,
        serverToken: undefined,
        encKey: undefined,
        macKey: undefined
    };
};

/**
 * Encrypt data with AES
 * @param data Data to encrypt
 * @param key Encryption key
 * @returns Encrypted data
 */
export const aesEncrypt = (data: Buffer, key: Buffer): Buffer => {
    const iv = randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final()
    ]);
    
    return Buffer.concat([iv, encrypted]);
};

/**
 * Decrypt AES encrypted data
 * @param data Data to decrypt
 * @param key Decryption key
 * @returns Decrypted data
 */
export const aesDecrypt = (data: Buffer, key: Buffer): Buffer => {
    const iv = data.slice(0, 16);
    const encryptedData = data.slice(16);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    return Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ]);
};

/**
 * HMAC-SHA256 sign data
 * @param data Data to sign
 * @param key Signing key
 * @returns Signature
 */
export const hmacSign = (data: Buffer, key: Buffer): Buffer => {
    return crypto.createHmac('sha256', key).update(data).digest();
};

/**
 * Hash data with SHA256
 * @param data Data to hash
 * @returns Hash
 */
export const sha256 = (data: Buffer): Buffer => {
    return crypto.createHash('sha256').update(data).digest();
};
