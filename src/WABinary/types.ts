import { BinaryNode } from './encoder';

/**
 * Types of binary message tags used in WhatsApp protocol
 */
export enum WABinaryMessageTag {
    STREAM_START = 'stream:start',
    STREAM_END = 'stream:end',
    STREAM_FEATURES = 'stream:features',
    STREAM_ERROR = 'stream:error',
    FAILURE = 'failure',
    SUCCESS = 'success',
    IQ = 'iq',
    MESSAGE = 'message',
    PRESENCE = 'presence',
    AUTH = 'auth',
    CHALLENGE = 'challenge',
    RESPONSE = 'response',
    PING = 'ping',
    PONG = 'pong'
}

/**
 * Types of binary message attributes
 */
export enum WABinaryMessageAttr {
    ID = 'id',
    TO = 'to',
    FROM = 'from',
    TYPE = 'type',
    CLASS = 'class',
    TIMESTAMP = 'timestamp',
    PARTICIPANT = 'participant',
    NOTIFY = 'notify',
    XMLNS = 'xmlns'
}

/**
 * Types of binary message node content tags
 */
export enum WABinaryNodeContent {
    BODY = 'body',
    MEDIA = 'media',
    ENCODED = 'enc',
    DEVICE_SENT_MESSAGE = 'device_sent_message',
    THUMBNAIL = 'thumbnail',
    COMPOSING = 'composing',
    PAUSED = 'paused',
    USER_STATE = 'user_state'
}

/**
 * Type guard to check if a value is a BinaryNode
 * @param node Value to check
 * @returns True if the value is a BinaryNode
 */
export const isBinaryNode = (node: any): node is BinaryNode => {
    return typeof node === 'object' && node !== null && typeof node.tag === 'string';
};

/**
 * Assertion function to throw if value is not a BinaryNode
 * @param node Value to check
 * @throws Error if the value is not a BinaryNode
 */
export const assertIsBinaryNode = (node: any): asserts node is BinaryNode => {
    if (!isBinaryNode(node)) {
        throw new Error('Expected a BinaryNode');
    }
};