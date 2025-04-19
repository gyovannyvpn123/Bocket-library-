import { EventEmitter } from 'events';

// Fundamental Types
export type WAMessageKey = {
    remoteJid: string;
    fromMe: boolean;
    id: string;
    participant?: string;
};

export type WAMessageContent = {
    conversation?: string;
    imageMessage?: WAImageMessage;
    videoMessage?: WAVideoMessage;
    audioMessage?: WAAudioMessage;
    documentMessage?: WADocumentMessage;
    stickerMessage?: WAStickerMessage;
    extendedTextMessage?: WAExtendedTextMessage;
    // Add other message types as needed
};

export type WAMessage = {
    key: WAMessageKey;
    message: WAMessageContent;
    messageTimestamp?: number;
    status?: WAMessageStatus;
    // Other message properties
};

export type WAImageMessage = {
    url: string;
    mimetype: string;
    caption?: string;
    fileSha256?: Buffer;
    fileLength?: number;
    height: number;
    width: number;
    mediaKey?: Buffer;
    fileEncSha256?: Buffer;
    directPath?: string;
    mediaKeyTimestamp?: number;
    jpegThumbnail?: Buffer;
    contextInfo?: WAContextInfo;
};

export type WAVideoMessage = {
    url: string;
    mimetype: string;
    fileSha256?: Buffer;
    fileLength?: number;
    seconds?: number;
    mediaKey?: Buffer;
    caption?: string;
    height?: number;
    width?: number;
    fileEncSha256?: Buffer;
    directPath?: string;
    mediaKeyTimestamp?: number;
    jpegThumbnail?: Buffer;
    streamingSidecar?: Buffer;
    contextInfo?: WAContextInfo;
};

export type WAAudioMessage = {
    url: string;
    mimetype: string;
    fileSha256?: Buffer;
    fileLength?: number;
    seconds?: number;
    ptt?: boolean;
    mediaKey?: Buffer;
    fileEncSha256?: Buffer;
    directPath?: string;
    mediaKeyTimestamp?: number;
    contextInfo?: WAContextInfo;
};

export type WADocumentMessage = {
    url: string;
    mimetype: string;
    title?: string;
    fileSha256?: Buffer;
    fileLength?: number;
    pageCount?: number;
    mediaKey?: Buffer;
    fileName?: string;
    fileEncSha256?: Buffer;
    directPath?: string;
    mediaKeyTimestamp?: number;
    jpegThumbnail?: Buffer;
    contextInfo?: WAContextInfo;
};

export type WAStickerMessage = {
    url: string;
    fileSha256?: Buffer;
    fileEncSha256?: Buffer;
    mediaKey?: Buffer;
    mimetype?: string;
    height?: number;
    width?: number;
    directPath?: string;
    fileLength?: number;
    mediaKeyTimestamp?: number;
    firstFrameSidecar?: Buffer;
    isAnimated?: boolean;
    contextInfo?: WAContextInfo;
};

export type WAExtendedTextMessage = {
    text: string;
    matchedText?: string;
    canonicalUrl?: string;
    description?: string;
    title?: string;
    previewType?: number;
    jpegThumbnail?: Buffer;
    contextInfo?: WAContextInfo;
};

export type WAContextInfo = {
    stanzaId?: string;
    participant?: string;
    quotedMessage?: WAMessageContent;
    remoteJid?: string;
    mentionedJid?: string[];
    isForwarded?: boolean;
    forwardingScore?: number;
};

export enum WAMessageStatus {
    ERROR = -1,
    PENDING = 0,
    SERVER_ACK = 1,
    DELIVERY_ACK = 2,
    READ = 3,
    PLAYED = 4,
}

export type WAChat = {
    id: string;
    conversationTimestamp?: number;
    unreadCount?: number;
    name?: string;
    lastMessageRecvTimestamp?: number;
};

export type WAContact = {
    id: string;
    name?: string;
    notify?: string;
    verifiedName?: string;
    imgUrl?: string;
    status?: string;
};

export type WAGroupParticipant = {
    id: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
};

export type WAGroupMetadata = {
    id: string;
    subject: string;
    creation: number;
    owner?: string;
    desc?: string;
    participants: WAGroupParticipant[];
};

export type WAConnectionState = 'open' | 'connecting' | 'close';

export type AuthenticationState = {
    creds: AuthenticationCreds;
    keys: SignalKeyStoreType;
};

export type SignalKeyStoreType = {
    preKeys: {
        [keyId: number]: {
            private: Uint8Array;
            public: Uint8Array;
        };
    };
    sessions: {
        [jid: string]: {
            [data: string]: any;
        };
    };
    'senderKeys': {
        [jid: string]: {
            [groupId: string]: {
                [senderKeyId: string]: {
                    [data: string]: any;
                };
            };
        };
    };
    'appStateSyncKeys': {
        [keyId: string]: any;
    };
    'appStateVersions': {
        [name: string]: any;
    };
};

export type AuthenticationCreds = {
    noiseKey: KeyPair;
    signedIdentityKey: KeyPair;
    signedPreKey: SignedKeyPair;
    registrationId: number;
    advSecretKey: string;
    nextPreKeyId: number;
    firstUnuploadedPreKeyId: number;
    serverHasPreKeys: boolean;
    account: any;
    me: any;
    signalIdentities: any[];
    lastAccountSyncTimestamp?: number;
    myAppStateKeyId?: string;
    processedHistoryMessages: any[];
    accountSettings: any;
};

export type KeyPair = {
    public: Uint8Array;
    private: Uint8Array;
};

export type SignedKeyPair = KeyPair & {
    signature: Uint8Array;
    keyId: number;
};

export type SocketConfig = {
    waWebSocketUrl: string | URL;
    connectTimeoutMs: number;
    defaultQueryTimeoutMs: number;
    keepAliveIntervalMs: number;
    logger: Logger;
    agent?: any;
    version: [number, number, number];
    browser: [string, string, string];
    auth: AuthenticationState;
    printQRInTerminal?: boolean;
    emitOwnEvents: boolean;
};

export type BocketOptions = Partial<SocketConfig> & {
    auth?: AuthenticationState;
    printQRInTerminal?: boolean;
    // Other relevant options
};

export interface BocketEventEmitter extends EventEmitter {
    on(event: 'connection.update', listener: (update: ConnectionState) => void): this;
    on(event: 'messages.upsert', listener: (messages: { messages: WAMessage[]; type: string }) => void): this;
    on(event: 'messages.update', listener: (messages: Partial<WAMessage>[]) => void): this;
    on(event: 'chats.upsert', listener: (chats: WAChat[]) => void): this;
    on(event: 'chats.update', listener: (chats: Partial<WAChat>[]) => void): this;
    on(event: 'contacts.upsert', listener: (contacts: WAContact[]) => void): this;
    on(event: 'contacts.update', listener: (contacts: Partial<WAContact>[]) => void): this;
    on(event: 'groups.upsert', listener: (groupMetadata: WAGroupMetadata[]) => void): this;
    on(event: 'groups.update', listener: (groupMetadata: Partial<WAGroupMetadata>[]) => void): this;
    on(event: 'qr', listener: (qr: string) => void): this;
    on(event: 'auth', listener: (state: AuthenticationState) => void): this;
    // Add more events as needed
}

export type ConnectionState = {
    connection: WAConnectionState;
    lastDisconnect?: {
        error?: Error;
        date: Date;
    };
    qr?: string;
    isNewLogin?: boolean;
};

export type Logger = {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    trace: (...args: any[]) => void;
};

// Message sending options
export type SendMessageOptions = {
    quoted?: WAMessage;
    contextInfo?: WAContextInfo;
    timestamp?: Date;
    messageId?: string;
};

export type SendTextOptions = SendMessageOptions;

export type SendImageOptions = SendMessageOptions & {
    caption?: string;
};

export type SendVideoOptions = SendMessageOptions & {
    caption?: string;
};

export type SendAudioOptions = SendMessageOptions & {
    ptt?: boolean;
};

export type SendDocumentOptions = SendMessageOptions & {
    fileName?: string;
    mimetype?: string;
};

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'sticker';

export * from './auth-state';
