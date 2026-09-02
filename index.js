const https = require('https');
const http = require('http');

const BOT_ID = process.env.BOT_ID;
const API_KEY = process.env.API_KEY;
const CLAN_ID = process.env.CLAN_ID;
const PORT = process.env.PORT || 3000;

console.log('Starting Wolvesville bot...');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running successfully!');
}).listen(PORT, () => {
    console.log(`Dummy HTTP server is listening on port ${PORT}`);
});

function checkNewMembers() {
    if (!CLAN_ID) {
        console.log('Error: CLAN_ID is missing in environment variables.');
        return;
    }

    const options = {
        hostname: 'api.wolvesville.com',
        path: `/clans/${encodeURIComponent(CLAN_ID)}`,
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
                const clanData = JSON.parse(data);
                console.log('Clan details fetched successfully. Name:', clanData.name, '| Members Count:', clanData.memberCount);
            } catch (e) {
                console.error('Error parsing clan data:', e);
            }
        });
    }).on('error', (err) => {
        console.error('Connection error:', err);
    });
}

setTimeout(() => {
    console.log('Bot is connected and ready!');
    checkNewMembers();
    setInterval(checkNewMembers, 10000);
}, 2000);
