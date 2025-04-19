import { 
    WAMessage, 
    WAMessageContent, 
    SendMessageOptions, 
    WAMessageKey
} from '../Types';
import { generateMessageID } from './index';

/**
 * Prepares a message for sending
 * @param jid JID to send message to
 * @param content Message content
 * @param options Message sending options
 * @returns Prepared message object
 */
export const prepareMessage = (
    jid: string,
    content: WAMessageContent,
    options: SendMessageOptions = {}
): WAMessage => {
    const messageId = options.messageId || generateMessageID();
    
    // Create message key
    const key: WAMessageKey = {
        remoteJid: jid,
        fromMe: true,
        id: messageId,
    };
    
    // Add participant if it's a group message
    if (jid.endsWith('@g.us') && options.contextInfo?.participant) {
        key.participant = options.contextInfo.participant;
    }
    
    // Add quoted message context info if provided
    if (options.quoted) {
        if (!options.contextInfo) {
            options.contextInfo = {};
        }
        
        options.contextInfo.stanzaId = options.quoted.key.id;
        options.contextInfo.participant = options.quoted.key.participant || options.quoted.key.remoteJid;
        options.contextInfo.quotedMessage = options.quoted.message;
    }
    
    // Add context info to content if provided
    if (options.contextInfo) {
        // Determine which message type to add context info to
        if (content.conversation) {
            content.extendedTextMessage = {
                text: content.conversation,
                contextInfo: options.contextInfo
            };
            delete content.conversation;
        } else if (content.extendedTextMessage) {
            content.extendedTextMessage.contextInfo = options.contextInfo;
        } else if (content.imageMessage) {
            content.imageMessage.contextInfo = options.contextInfo;
        } else if (content.videoMessage) {
            content.videoMessage.contextInfo = options.contextInfo;
        } else if (content.audioMessage) {
            content.audioMessage.contextInfo = options.contextInfo;
        } else if (content.documentMessage) {
            content.documentMessage.contextInfo = options.contextInfo;
        } else if (content.stickerMessage) {
            content.stickerMessage.contextInfo = options.contextInfo;
        }
        // Add more message types as needed
    }
    
    return {
        key,
        message: content,
        messageTimestamp: Math.floor(
            (options.timestamp || new Date()).getTime() / 1000
        )
    };
};

/**
 * Creates a text message
 * @param text Message text
 * @returns Message content object
 */
export const createTextMessage = (text: string): WAMessageContent => {
    return {
        conversation: text
    };
};

/**
 * Creates an extended text message (for messages with mentions, etc.)
 * @param text Message text
 * @param mentionedJids Array of JIDs to mention
 * @returns Message content object
 */
export const createExtendedTextMessage = (
    text: string, 
    mentionedJids?: string[]
): WAMessageContent => {
    const extendedText: WAMessageContent = {
        extendedTextMessage: {
            text: text
        }
    };
    
    if (mentionedJids && mentionedJids.length > 0) {
        extendedText.extendedTextMessage.contextInfo = {
            mentionedJid: mentionedJids
        };
    }
    
    return extendedText;
};

/**
 * Extracts text content from a message
 * @param message The message to extract text from
 * @returns Text content or undefined if no text found
 */
export const extractMessageText = (message: WAMessageContent): string | undefined => {
    if (message.conversation) {
        return message.conversation;
    } else if (message.extendedTextMessage?.text) {
        return message.extendedTextMessage.text;
    } else if (message.imageMessage?.caption) {
        return message.imageMessage.caption;
    } else if (message.videoMessage?.caption) {
        return message.videoMessage.caption;
    }
    
    return undefined;
};

/**
 * Checks if a message has a media attachment
 * @param message Message to check
 * @returns True if message has media
 */
export const hasMediaMessage = (message: WAMessageContent): boolean => {
    return Boolean(
        message.imageMessage ||
        message.videoMessage ||
        message.audioMessage ||
        message.documentMessage ||
        message.stickerMessage
    );
};

/**
 * Gets media type from a message
 * @param message Message to check
 * @returns Media type or undefined if no media
 */
export const getMediaType = (message: WAMessageContent): string | undefined => {
    if (message.imageMessage) return 'image';
    if (message.videoMessage) return 'video';
    if (message.audioMessage) return 'audio';
    if (message.documentMessage) return 'document';
    if (message.stickerMessage) return 'sticker';
    return undefined;
};

/**
 * Gets the filename for a media message
 * @param message Message with media
 * @returns Filename or undefined
 */
export const getMediaFilename = (message: WAMessageContent): string | undefined => {
    if (message.documentMessage?.fileName) {
        return message.documentMessage.fileName;
    }
    
    const mediaType = getMediaType(message);
    if (!mediaType) return undefined;
    
    const extension = getMediaExtension(message);
    if (!extension) return undefined;
    
    return `${Date.now()}.${extension}`;
};

/**
 * Gets file extension for media message
 * @param message Message with media
 * @returns File extension or undefined
 */
export const getMediaExtension = (message: WAMessageContent): string | undefined => {
    if (message.imageMessage?.mimetype) {
        return message.imageMessage.mimetype.split('/')[1];
    } else if (message.videoMessage?.mimetype) {
        return message.videoMessage.mimetype.split('/')[1];
    } else if (message.audioMessage?.mimetype) {
        return message.audioMessage.mimetype.split('/')[1];
    } else if (message.documentMessage?.mimetype) {
        return message.documentMessage.mimetype.split('/')[1];
    } else if (message.stickerMessage?.mimetype) {
        return message.stickerMessage.mimetype.split('/')[1];
    }
    
    return undefined;
};
