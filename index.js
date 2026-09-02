const https = require('https');

const BOT_ID = process.env.BOT_ID;
const API_KEY = process.env.API_KEY;
const CLAN_ID = process.env.CLAN_ID;

console.log('Starting Wolvesville bot...');

// Function to send a chat message to the clan
function sendClanChatMessage(message) {
    if (!CLAN_ID) {
        console.log('Error: CLAN_ID is missing in environment variables.');
        return;
    }

    const data = JSON.stringify({ message: message });
    const options = {
        hostname: 'api.wolvesville.com',
        path: `/clans/${CLAN_ID}/chat`,
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

// Function to check clan members
function checkNewMembers() {
    if (!CLAN_ID) return;

    const options = {
        hostname: 'api.wolvesville.com',
        path: `/clans/${CLAN_ID}/members`,
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
                const members = JSON.parse(data);
                console.log('Members fetched successfully. Total count:', Array.isArray(members) ? members.length : 'Unknown');
            } catch (e) {
                console.error('Error parsing members data:', e);
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
    // Check members every 10 seconds
    setInterval(checkNewMembers, 10000);
}, 2000);
          
