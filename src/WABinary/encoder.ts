import { BinaryNode, BinaryNodeAttributes } from './types';
import { BinaryNodeCodingOptions } from './index';

/**
 * Write a string to a buffer
 * @param str String to write
 * @param buffer Buffer to write to
 * @param offset Start offset in buffer
 * @returns New offset
 */
const writeString = (
    str: string,
    buffer: Buffer,
    offset: number
): number => {
    const strLen = Buffer.byteLength(str);
    if (strLen >= 4096) {
        // Large string
        buffer[offset] = 254;
        buffer.writeUInt32BE(strLen, offset + 1);
        offset += 5;
        buffer.write(str, offset, strLen);
        return offset + strLen;
    } else if (strLen >= 256) {
        // Medium string
        buffer[offset] = 253;
        buffer.writeUInt16BE(strLen, offset + 1);
        offset += 3;
        buffer.write(str, offset, strLen);
        return offset + strLen;
    } else {
        // Small string
        buffer[offset] = strLen;
        offset += 1;
        buffer.write(str, offset, strLen);
        return offset + strLen;
    }
};

/**
 * Write a token to a buffer
 * @param token Token to write
 * @param buffer Buffer to write to
 * @param offset Start offset in buffer
 * @param options Coding options
 * @returns New offset
 */
const writeToken = (
    token: string,
    buffer: Buffer,
    offset: number,
    options: BinaryNodeCodingOptions
): number => {
    if (!options.TOKEN_MAP) {
        throw new Error('TOKEN_MAP is required in options');
    }
    
    const tokenIndex = options.TOKEN_MAP[token];
    
    if (tokenIndex === undefined) {
        // Token not found in map, write as string
        return writeString(token, buffer, offset);
    }
    
    if (tokenIndex < 245) {
        // Single byte token
        buffer[offset] = tokenIndex;
        return offset + 1;
    } else if (tokenIndex <= 500) {
        // Double byte token
        buffer[offset] = 245;
        buffer[offset + 1] = tokenIndex - 245;
        return offset + 2;
    }
    
    // Should not reach here with valid tokens
    throw new Error(`Invalid token index: ${tokenIndex}`);
};

/**
 * Calculate the size needed to encode attributes
 * @param attrs Attributes to encode
 * @param options Coding options
 * @returns Size in bytes
 */
const calculateAttributesSize = (
    attrs: BinaryNodeAttributes,
    options: BinaryNodeCodingOptions
): number => {
    let size = 0;
    
    for (const key in attrs) {
        // Size for key
        const keySize = key.length <= 255 ? key.length + 1 : key.length + 3;
        size += keySize;
        
        // Size for value
        const value = attrs[key];
        if (typeof value === 'string') {
            const valueSize = value.length <= 255 ? value.length + 1 : value.length + 3;
            size += valueSize;
        } else if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
            // Buffer/Uint8Array: 1 byte type, 1-5 bytes length, n bytes data
            size += 1;
            
            if (value.length >= 4096) {
                size += 5;
            } else if (value.length >= 256) {
                size += 3;
            } else {
                size += 1;
            }
            
            size += value.length;
        } else if (Array.isArray(value)) {
            // We don't support arrays directly
            throw new Error('Arrays in attributes are not supported');
        } else {
            // Non-string, non-buffer: convert to string
            const strValue = String(value);
            const valueSize = strValue.length <= 255 ? strValue.length + 1 : strValue.length + 3;
            size += valueSize;
        }
    }
    
    return size;
};

/**
 * Write attributes to a buffer
 * @param attrs Attributes to write
 * @param buffer Buffer to write to
 * @param offset Start offset in buffer
 * @param options Coding options
 * @returns New offset
 */
const writeAttributes = (
    attrs: BinaryNodeAttributes,
    buffer: Buffer,
    offset: number,
    options: BinaryNodeCodingOptions
): number => {
    for (const key in attrs) {
        // Write key
        offset = writeString(key, buffer, offset);
        
        // Write value
        const value = attrs[key];
        
        if (typeof value === 'string') {
            offset = writeString(value, buffer, offset);
        } else if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
            // Write as binary
            buffer[offset] = 252; // Binary type
            offset += 1;
            
            const valueLen = value.length;
            if (valueLen >= 4096) {
                buffer[offset] = 254;
                buffer.writeUInt32BE(valueLen, offset + 1);
                offset += 5;
            } else if (valueLen >= 256) {
                buffer[offset] = 253;
                buffer.writeUInt16BE(valueLen, offset + 1);
                offset += 3;
            } else {
                buffer[offset] = valueLen;
                offset += 1;
            }
            
            Buffer.from(value).copy(buffer, offset, 0, valueLen);
            offset += valueLen;
        } else {
            // Convert to string
            offset = writeString(String(value), buffer, offset);
        }
    }
    
    return offset;
};

/**
 * Calculate the size needed to encode a list of nodes
 * @param nodes Nodes to encode
 * @param options Coding options
 * @returns Size in bytes
 */
const calculateListSize = (
    nodes: BinaryNode[],
    options: BinaryNodeCodingOptions
): number => {
    let size = 0;
    
    for (const node of nodes) {
        size += calculateNodeSize(node, options);
    }
    
    return size;
};

/**
 * Calculate the size needed to encode a node
 * @param node Node to encode
 * @param options Coding options
 * @returns Size in bytes
 */
const calculateNodeSize = (
    node: BinaryNode,
    options: BinaryNodeCodingOptions
): number => {
    let size = 2; // 1 byte for list start, 1 byte for list end
    
    // Size for tag
    size += 1; // 1 byte for tag type
    if (node.tag) {
        const tokenIndex = options.TOKEN_MAP?.[node.tag];
        
        if (tokenIndex === undefined) {
            // Not a token
            size += node.tag.length + 1; // String size + 1 for length
        } else if (tokenIndex >= 245 && tokenIndex <= 500) {
            // Double byte token
            size += 1;
        }
    }
    
    // Size for attributes
    const attributesCount = node.attrs ? Object.keys(node.attrs).length : 0;
    if (attributesCount > 0) {
        size += calculateAttributesSize(node.attrs!, options);
    }
    
    // Size for content
    if (node.content) {
        if (typeof node.content === 'string') {
            size += node.content.length + 1; // String size + 1 for length
        } else if (Buffer.isBuffer(node.content) || node.content instanceof Uint8Array) {
            size += node.content.length + 2; // Buffer size + 1 for type + 1 for length
        } else if (Array.isArray(node.content)) {
            size += calculateListSize(node.content, options);
        }
    }
    
    return size;
};

/**
 * Write a node to a buffer
 * @param node Node to write
 * @param buffer Buffer to write to
 * @param offset Start offset in buffer
 * @param options Coding options
 * @returns New offset
 */
const writeNode = (
    node: BinaryNode,
    buffer: Buffer,
    offset: number,
    options: BinaryNodeCodingOptions
): number => {
    buffer[offset] = 248; // List start
    offset += 1;
    
    // Write tag
    if (node.tag) {
        offset = writeToken(node.tag, buffer, offset, options);
    } else {
        buffer[offset] = 0; // Empty string
        offset += 1;
    }
    
    // Write attributes
    if (node.attrs && Object.keys(node.attrs).length > 0) {
        offset = writeAttributes(node.attrs, buffer, offset, options);
    }
    
    // Write content
    if (node.content) {
        if (typeof node.content === 'string') {
            offset = writeString(node.content, buffer, offset);
        } else if (Buffer.isBuffer(node.content) || node.content instanceof Uint8Array) {
            buffer[offset] = 252; // Binary type
            offset += 1;
            
            const contentLen = node.content.length;
            if (contentLen >= 4096) {
                buffer[offset] = 254;
                buffer.writeUInt32BE(contentLen, offset + 1);
                offset += 5;
            } else if (contentLen >= 256) {
                buffer[offset] = 253;
                buffer.writeUInt16BE(contentLen, offset + 1);
                offset += 3;
            } else {
                buffer[offset] = contentLen;
                offset += 1;
            }
            
            Buffer.from(node.content).copy(buffer, offset, 0, contentLen);
            offset += contentLen;
        } else if (Array.isArray(node.content)) {
            for (const childNode of node.content) {
                offset = writeNode(childNode, buffer, offset, options);
            }
        }
    }
    
    buffer[offset] = 249; // List end
    offset += 1;
    
    return offset;
};

/**
 * Encode a binary node into a buffer
 * @param node Node to encode
 * @param buffer Buffer to write to (optional)
 * @param options Coding options
 * @returns Encoded buffer
 */
export const encodeBinaryNodeInternal = (
    node: BinaryNode,
    buffer?: Buffer,
    options: BinaryNodeCodingOptions = {
        TAGS_LIST: [],
        SINGLE_BYTE_TOKENS: [],
        DOUBLE_BYTE_TOKENS: []
    }
): Buffer => {
    const nodeSize = calculateNodeSize(node, options);
    const buf = buffer || Buffer.alloc(nodeSize);
    
    writeNode(node, buf, 0, options);
    
    return buf;
};
