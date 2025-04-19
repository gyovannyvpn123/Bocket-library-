import { BinaryNode } from './types';
import { encodeBinaryNodeInternal } from './encoder';
import { decodeBinaryNodeInternal } from './decoder';

export type BinaryNodeCodingOptions = {
    TAGS_LIST: string[];
    SINGLE_BYTE_TOKENS: string[];
    DOUBLE_BYTE_TOKENS: string[];
    TOKEN_MAP?: Record<string, number>;
};

// Default WABinary coding options
// These are simplified - a real implementation would have the complete token lists
const DEFAULT_CODING_OPTIONS: BinaryNodeCodingOptions = {
    TAGS_LIST: [
        'action', 'add', 'alert', 'all', 'auth', 'body', 'broadcast', 'chat',
        'clear', 'code', 'composing', 'contacts', 'count', 'create', 'delete',
        'demote', 'duplicate', 'encoding', 'error', 'false', 'filehash', 'from',
        'g.us', 'group', 'groups', 'history', 'id', 'image', 'in', 'index',
        'invite', 'jid', 'key', 'leave', 'list', 'media', 'message', 'name',
        'notification', 'notify', 'out', 'owner', 'participant', 'paused',
        'picture', 'ping', 'pong', 'promote', 'query', 'read', 'receipt',
        'received', 'relay', 'remove', 'request', 'response', 'resume', 'retry',
        's.whatsapp.net', 'seconds', 'set', 'status', 'subject', 'subscribe',
        'success', 't', 'text', 'to', 'true', 'type', 'unavailable', 'unsubscribe',
        'update', 'user', 'value', 'web', 'video', 'xml', 'mute', 'unmute',
        'last', 'unread', 'epoch', 'device', 'presence'
    ],
    SINGLE_BYTE_TOKENS: [
        'xmlstreamstart', 'xmlstreamend', 'path', 'token', 'resume'
    ],
    DOUBLE_BYTE_TOKENS: [
        'adduserkey', 'offer', 'audio', 'transaction', 'userhash', 'useragent'
    ]
};

// Initialize token map for faster lookup
const TOKEN_MAP: Record<string, number> = {};

// Populate the token map
for (let i = 0; i < DEFAULT_CODING_OPTIONS.TAGS_LIST.length; i++) {
    TOKEN_MAP[DEFAULT_CODING_OPTIONS.TAGS_LIST[i]] = i;
}

for (let i = 0; i < DEFAULT_CODING_OPTIONS.SINGLE_BYTE_TOKENS.length; i++) {
    TOKEN_MAP[DEFAULT_CODING_OPTIONS.SINGLE_BYTE_TOKENS[i]] = 236 + i;
}

for (let i = 0; i < DEFAULT_CODING_OPTIONS.DOUBLE_BYTE_TOKENS.length; i++) {
    TOKEN_MAP[DEFAULT_CODING_OPTIONS.DOUBLE_BYTE_TOKENS[i]] = 237 + i;
}

DEFAULT_CODING_OPTIONS.TOKEN_MAP = TOKEN_MAP;

/**
 * Encode a binary node into a buffer
 * @param node Node to encode
 * @param buffer Buffer to write to (optional)
 * @param options Coding options
 * @returns Encoded buffer
 */
export const encodeBinaryNode = (
    node: BinaryNode,
    buffer?: Buffer,
    options: BinaryNodeCodingOptions = DEFAULT_CODING_OPTIONS
): Buffer => {
    return encodeBinaryNodeInternal(node, buffer, options);
};

/**
 * Decode a buffer into a binary node
 * @param data Buffer to decode
 * @param options Coding options
 * @returns Decoded node
 */
export const decodeBinaryNode = (
    data: Buffer,
    options: BinaryNodeCodingOptions = DEFAULT_CODING_OPTIONS
): BinaryNode => {
    return decodeBinaryNodeInternal(data, options);
};

export * from './types';
export * from './encoder';
export * from './decoder';
