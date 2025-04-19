import { isJidValid } from './index';

/**
 * Validate a JID and throw an error if invalid
 * @param jid JID to validate
 * @throws Error if JID is invalid
 */
export const validateJid = (jid: string): void => {
    if (!isJidValid(jid)) {
        throw new Error(`Invalid JID: ${jid}`);
    }
};

/**
 * Validate that the specified object has the required properties
 * @param obj Object to validate
 * @param properties Array of property names that must exist
 * @param objName Name of object for error message
 * @throws Error if properties are missing
 */
export const validateRequiredProps = (
    obj: Record<string, any>, 
    properties: string[], 
    objName: string
): void => {
    const missing = properties.filter(prop => obj[prop] === undefined);
    
    if (missing.length > 0) {
        throw new Error(
            `Missing required properties for ${objName}: ${missing.join(', ')}`
        );
    }
};

/**
 * Validate that a value is a Buffer or Uint8Array
 * @param value Value to validate
 * @param name Name for error message
 * @throws Error if value is not a Buffer or Uint8Array
 */
export const validateBuffer = (value: any, name: string): void => {
    if (!(value instanceof Buffer) && !(value instanceof Uint8Array)) {
        throw new Error(`${name} must be a Buffer or Uint8Array`);
    }
};

/**
 * Validate that a value is a string
 * @param value Value to validate
 * @param name Name for error message
 * @throws Error if value is not a string
 */
export const validateString = (value: any, name: string): void => {
    if (typeof value !== 'string') {
        throw new Error(`${name} must be a string`);
    }
};

/**
 * Validate that a value is a number
 * @param value Value to validate
 * @param name Name for error message
 * @throws Error if value is not a number
 */
export const validateNumber = (value: any, name: string): void => {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`${name} must be a number`);
    }
};

/**
 * Validate that a value is a boolean
 * @param value Value to validate
 * @param name Name for error message
 * @throws Error if value is not a boolean
 */
export const validateBoolean = (value: any, name: string): void => {
    if (typeof value !== 'boolean') {
        throw new Error(`${name} must be a boolean`);
    }
};

/**
 * Validate that a value is within a range
 * @param value Value to validate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @param name Name for error message
 * @throws Error if value is out of range
 */
export const validateRange = (
    value: number, 
    min: number, 
    max: number, 
    name: string
): void => {
    validateNumber(value, name);
    
    if (value < min || value > max) {
        throw new Error(`${name} must be between ${min} and ${max}`);
    }
};

/**
 * Validate that a value is in a set of allowed values
 * @param value Value to validate
 * @param allowed Set of allowed values
 * @param name Name for error message
 * @throws Error if value is not allowed
 */
export const validateEnum = <T>(
    value: T, 
    allowed: T[], 
    name: string
): void => {
    if (!allowed.includes(value)) {
        throw new Error(
            `${name} must be one of: ${allowed.join(', ')}`
        );
    }
};

/**
 * Validate media parameters
 * @param mimetype MIME type of media
 * @param fileSize Size of file
 * @param maxSize Maximum allowed size
 * @throws Error if validation fails
 */
export const validateMedia = (
    mimetype: string, 
    fileSize: number, 
    maxSize: number
): void => {
    validateString(mimetype, 'Mimetype');
    validateNumber(fileSize, 'File size');
    
    if (fileSize > maxSize) {
        throw new Error(`File size exceeds maximum allowed (${maxSize} bytes)`);
    }
    
    // Basic MIME type validation
    if (!mimetype.includes('/')) {
        throw new Error(`Invalid MIME type: ${mimetype}`);
    }
};
