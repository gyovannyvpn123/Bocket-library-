/**
 * Binary node attributes type
 */
export type BinaryNodeAttributes = Record<string, string | Buffer | Uint8Array>;

/**
 * Binary node structure
 */
export interface BinaryNode {
    tag: string;
    attrs?: BinaryNodeAttributes;
    content?: string | Buffer | Uint8Array | BinaryNode[];
}

/**
 * Extended binary node with additional metadata
 */
export interface ExtendedBinaryNode extends BinaryNode {
    index?: number;
    meta?: Record<string, any>;
}
