import { BocketClient } from '../src';

// Create a Bocket client
const bocket = new BocketClient({
    printQRInTerminal: true  // Print QR code in terminal
});

// Listen for connection updates
bocket.on('connection.update', (update) => {
    console.log('Connection update:', update);
    
    // Check if connected
    if (update.connection === 'open') {
        console.log('Connected successfully!');
    }
});

// Listen for messages
bocket.on('messages.upsert', async (messageUpdate) => {
    const { messages, type } = messageUpdate;
    
    if (type !== 'notify') return;
    
    // Process each message
    for (const message of messages) {
        // Skip messages sent by us
        if (message.key.fromMe) continue;
        
        const messageContent = message.message;
        const senderJid = message.key.remoteJid!;
        
        // Check for text messages
        if (messageContent?.conversation) {
            console.log(`Received message from ${senderJid}: ${messageContent.conversation}`);
            
            // Auto-reply
            await bocket.sendMessage(
                senderJid,
                `Echo: ${messageContent.conversation}`,
                { quoted: message }
            );
        }
    }
});

// Start the client
const startBocket = async () => {
    try {
        console.log('Starting Bocket...');
        await bocket.connect();
    } catch (error) {
        console.error('Error connecting to WhatsApp:', error);
    }
};

// Run the client
startBocket();

// Handle exit
process.on('SIGINT', async () => {
    console.log('Disconnecting...');
    // No need to logout, just exit
    process.exit(0);
});
