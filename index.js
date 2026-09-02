const https = require('https');
const http = require('http');

const BOT_ID = process.env.BOT_ID;
const API_KEY = process.env.API_KEY;
const CLAN_NAME = process.env.CLAN_NAME;
const PORT = process.env.PORT || 3000;

console.log('Starting Wolvesville bot...');

// Create a dummy HTTP server to satisfy Render's web service port requirement for free tier
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running successfully!');
}).listen(PORT, () => {
    console.log(`Dummy HTTP server is listening on port ${PORT}`);
});

// Function to send a chat message to the clan
function sendClanChatMessage(message) {
    if (!CLAN_NAME) {
        console.log('Error: CLAN_NAME is missing in environment variables.');
        return;
    }

    const data = JSON.stringify({ message: message });
    const options = {
        hostname: 'api.wolvesville.com',
        path: `/clans/${encodeURIComponent(CLAN_NAME)}/chat`,
        method: 'POST',
        headers: {
            'Authorization': `Bot ${API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            console.log('Message sent successfully:', responseBody);
        });
    });

    req.on('error', (error) => {
        console.error('Error sending message:', error);
    });

    req.write(data);
    req.end();
}

// Function to check clan members using the authorized clans endpoint
function checkNewMembers() {
    const options = {
        hostname: 'api.wolvesville.com',
        path: `/clans/authorized`,
        method: 'GET',
        headers: {
            'Authorization': `Bot ${API_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    https.get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const clans = JSON.parse(data);
                console.log('Authorized clans fetched successfully. Total:', Array.isArray(clans) ? clans.length : 'Unknown');
            } catch (e) {
                console.error('Error parsing clans data:', e);
            }
        });
    }).on('error', (err) => {
        console.error('Connection error:', err);
    });
}

// Initialize the bot and run periodic checks
setTimeout(() => {
    console.log('Bot is connected and ready!');
    checkNewMembers();
    // Check every 10 seconds
    setInterval(checkNewMembers, 10000);
}, 2000);
