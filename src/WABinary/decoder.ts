import { BinaryNode } from './encoder';

/**
 * Decode a binary WhatsApp message to a BinaryNode
 * @param data The binary data to decode
 * @returns Decoded binary node
 */
export const decodeBinaryNode = (data: Buffer): BinaryNode => {
    // This is a simplified placeholder implementation
    // In a real implementation, we'd parse the WhatsApp binary format properly
    
    // For simulation, assume the buffer contains a JSON string
    try {
        const jsonStr = data.toString('utf-8');
        return JSON.parse(jsonStr) as BinaryNode;
    } catch (error) {
        // Handle parsing errors
        throw new Error(`Failed to decode binary data: ${error}`);
    }
};

/**
 * Extract attributes from a binary node
 * @param node The binary node
 * @returns Attributes object
 */
export const extractNodeAttributes = (node: BinaryNode): Record<string, string> => {
    return node.attrs || {};
};

/**
 * Extract child nodes from a binary node
 * @param node The binary node
 * @returns Array of child nodes
 */
export const extractNodeChildren = (node: BinaryNode): BinaryNode[] => {
    if (!node.content || typeof node.content === 'string' || node.content instanceof Buffer) {
        return [];
    }
    
    return node.content.filter(child => 
        typeof child !== 'string' && !(child instanceof Buffer)
    ) as BinaryNode[];
};

/**
 * Get a specific child node by tag name
 * @param node The parent node
 * @param tag The tag to search for
 * @returns Matching child node or undefined
 */
export const getNodeChildByTag = (node: BinaryNode, tag: string): BinaryNode | undefined => {
    const children = extractNodeChildren(node);
    return children.find(child => child.tag === tag);
};

/**
 * Get all child nodes with a specific tag
 * @param node The parent node
 * @param tag The tag to search for
 * @returns Array of matching child nodes
 */
export const getAllNodeChildrenByTag = (node: BinaryNode, tag: string): BinaryNode[] => {
    const children = extractNodeChildren(node);
    return children.filter(child => child.tag === tag);
};

/**
 * Extract text content from a node
 * @param node The node
 * @returns Text content or undefined
 */
export const extractNodeTextContent = (node: BinaryNode): string | undefined => {
    if (!node.content) {
        return undefined;
    }
    
    if (typeof node.content === 'string') {
        return node.content;
    }
    
    if (node.content instanceof Buffer) {
        return node.content.toString('utf-8');
    }
    
    // For array content, concatenate strings
    return node.content
        .filter(content => typeof content === 'string')
        .join('');
};