import { BinaryNode, BinaryNodeAttributes } from './types';
import { BinaryNodeCodingOptions } from './index';

/**
 * Read a string from a buffer
 * @param buffer Buffer to read from
 * @param index Current index
 * @returns String and new index
 */
const readString = (
    buffer: Buffer,
    index: number
): { result: string; index: number } => {
    const stringLength = buffer[index];
    index += 1;
    
    if (stringLength === 253) {
        // Medium string (16-bit length)
        const length = buffer.readUInt16BE(index);
        index += 2;
        const result = buffer.toString('utf-8', index, index + length);
        index += length;
        return { result, index };
    } else if (stringLength === 254) {
        // Large string (32-bit length)
        const length = buffer.readUInt32BE(index);
        index += 4;
        const result = buffer.toString('utf-8', index, index + length);
        index += length;
        return { result, index };
    } else {
        // Small string (8-bit length)
        const result = buffer.toString('utf-8', index, index + stringLength);
        index += stringLength;
        return { result, index };
    }
};

/**
 * Read a token from a buffer
 * @param buffer Buffer to read from
 * @param index Current index
 * @param options Coding options
 * @returns Token and new index
 */
const readToken = (
    buffer: Buffer,
    index: number,
    options: BinaryNodeCodingOptions
): { result: string; index: number } => {
    const tokenIndex = buffer[index];
    index += 1;
    
    if (tokenIndex === 0) {
        // Empty string
        return { result: '', index };
    } else if (tokenIndex < 245) {
        // Single byte token
        const token = options.TAGS_LIST[tokenIndex];
        return { result: token, index };
    } else if (tokenIndex === 245) {
        // Double byte token
        const secondaryIndex = buffer[index];
        index += 1;
        
        const token = options.DOUBLE_BYTE_TOKENS[secondaryIndex];
        return { result: token, index };
    } else if (tokenIndex === 252) {
        // Binary data
        const result = readBinary(buffer, index);
        index = result.index;
        return { result: result.result.toString('base64'), index };
    } else {
        // String
        index -= 1; // Move back to re-read the length byte
        return readString(buffer, index);
    }
};

/**
 * Read binary data from a buffer
 * @param buffer Buffer to read from
 * @param index Current index
 * @returns Binary data and new index
 */
const readBinary = (
    buffer: Buffer,
    index: number
): { result: Buffer; index: number } => {
    const binaryLength = buffer[index];
    index += 1;
    
    let length: number;
    
    if (binaryLength === 253) {
        // Medium binary (16-bit length)
        length = buffer.readUInt16BE(index);
        index += 2;
    } else if (binaryLength === 254) {
        // Large binary (32-bit length)
        length = buffer.readUInt32BE(index);
        index += 4;
    } else {
        // Small binary (8-bit length)
        length = binaryLength;
    }
    
    const result = Buffer.from(buffer.slice(index, index + length));
    index += length;
    
    return { result, index };
};

/**
 * Read attributes from a buffer
 * @param buffer Buffer to read from
 * @param index Current index
 * @param options Coding options
 * @returns Attributes and new index
 */
const readAttributes = (
    buffer: Buffer,
    index: number,
    attributesLength: number,
    options: BinaryNodeCodingOptions
): { attributes: BinaryNodeAttributes; index: number } => {
    const attributes: BinaryNodeAttributes = {};
    
    for (let i = 0; i < attributesLength; i++) {
        // Read key
        const keyResult = readString(buffer, index);
        const key = keyResult.result;
        index = keyResult.index;
        
        // Read value
        const valueType = buffer[index];
        
        if (valueType === 252) {
            // Binary value
            index += 1;
            const valueResult = readBinary(buffer, index);
            attributes[key] = valueResult.result;
            index = valueResult.index;
        } else {
            // String value
            const valueResult = readString(buffer, index);
            attributes[key] = valueResult.result;
            index = valueResult.index;
        }
    }
    
    return { attributes, index };
};

/**
 * Read a binary node from a buffer
 * @param buffer Buffer to read from
 * @param index Current index
 * @param options Coding options
 * @returns Node and new index
 */
const readNode = (
    buffer: Buffer,
    index: number,
    options: BinaryNodeCodingOptions
): { node: BinaryNode; index: number } => {
    if (buffer[index] !== 248) {
        throw new Error(`Invalid list type: ${buffer[index]}`);
    }
    
    index += 1;
    
    // Read tag
    const tagResult = readToken(buffer, index, options);
    const tag = tagResult.result;
    index = tagResult.index;
    
    // Read attributes
    const attributes = {};
    
    // Read node content
    let content: string | Buffer | BinaryNode[] | undefined;
    
    if (buffer[index] === 248) {
        // List content (child nodes)
        const children: BinaryNode[] = [];
        
        while (buffer[index] === 248) {
            const childResult = readNode(buffer, index, options);
            children.push(childResult.node);
            index = childResult.index;
        }
        
        content = children;
    } else if (buffer[index] === 252) {
        // Binary content
        index += 1;
        const binaryResult = readBinary(buffer, index);
        content = binaryResult.result;
        index = binaryResult.index;
    } else if (buffer[index] !== 249) {
        // String content
        const stringResult = readString(buffer, index);
        content = stringResult.result;
        index = stringResult.index;
    }
    
    // Ensure we read the list end
    if (buffer[index] !== 249) {
        throw new Error(`Invalid list end: ${buffer[index]}`);
    }
    
    index += 1;
    
    return {
        node: {
            tag,
            attrs: Object.keys(attributes).length > 0 ? attributes : undefined,
            content
        },
        index
    };
};

/**
 * Decode a buffer into a binary node
 * @param data Buffer to decode
 * @param options Coding options
 * @returns Decoded node
 */
export const decodeBinaryNodeInternal = (
    data: Buffer,
    options: BinaryNodeCodingOptions
): BinaryNode => {
    const { node } = readNode(data, 0, options);
    return node;
};
