import { Logger } from '../Types';

// Create a default logger implementation
export const createDefaultLogger = (): Logger => {
    return {
        info: (...args) => console.info(...args),
        warn: (...args) => console.warn(...args),
        error: (...args) => console.error(...args),
        debug: (...args) => console.debug(...args),
        trace: (...args) => console.trace(...args),
    };
};

/**
 * Validate phone number in standard format
 * @param phoneNumber Phone number to validate
 */
export const validatePhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber.match(/^\+?[0-9]{10,15}$/)) {
        throw new Error(`Invalid phone number: ${phoneNumber}`);
    }
    return phoneNumber.replace(/[^\d]/g, '');
};

/**
 * Generate a random ID for messages
 * @returns Random message ID
 */
export const generateMessageID = (): string => {
    return `3EB0${[...Array(20)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
};

/**
 * Create a JID from a phone number
 * @param phoneNumber Phone number
 * @returns Formatted JID string
 */
export const createJID = (phoneNumber: string): string => {
    return `${validatePhoneNumber(phoneNumber)}@s.whatsapp.net`;
};

/**
 * Create a group JID
 * @param groupId Group ID
 * @returns Formatted group JID
 */
export const createGroupJID = (groupId: string): string => {
    return `${groupId}@g.us`;
};

/**
 * Get Unix timestamp in seconds
 * @returns Current timestamp
 */
export const unixTimestampSeconds = (): number => {
    return Math.floor(Date.now() / 1000);
};

/**
 * Delay execution
 * @param ms Milliseconds to delay
 */
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Convert a buffer to a base64 string
 * @param buffer Buffer to convert
 * @returns Base64 string
 */
export const bufferToBase64 = (buffer: Buffer): string => {
    return buffer.toString('base64');
};

/**
 * Convert a base64 string to a buffer
 * @param base64 Base64 string
 * @returns Buffer
 */
export const base64ToBuffer = (base64: string): Buffer => {
    return Buffer.from(base64, 'base64');
};

/**
 * Check if a string is a valid JID
 * @param jid JID to validate
 * @returns True if valid
 */
export const isJidValid = (jid: string): boolean => {
    return Boolean(jid?.match(/^[0-9]+@(s.whatsapp.net|g.us)$/));
};

/**
 * Extract the ID from a JID
 * @param jid JID to extract from
 * @returns ID portion
 */
export const extractJidId = (jid: string): string => {
    return jid.split('@')[0];
};

/**
 * Check if a JID is for a group
 * @param jid JID to check
 * @returns True if group JID
 */
export const isGroupJid = (jid: string): boolean => {
    return jid.endsWith('@g.us');
};

export * from './messages';
export * from './auth';
export * from './validate';
