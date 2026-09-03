const https = require('https');
const http = require('http');

const API_KEY = process.env.API_KEY;
const CLAN_ID = process.env.CLAN_ID || "cc381093-ddbd-48f7-aea1-1740959a2ce7";
const PORT = process.env.PORT || 3000;

let previousCount = null;

http.createServer((req, res) => res.end('OK')).listen(PORT);

function sendWelcomeMessage() {
    const messageText = `🐺 Welcome to Dz|Asl! 🎉 Glad to have you.\n📌 Please contribute 200 Gold as an entry fee. Enjoy! 🚀`;
    const data = JSON.stringify({ message: messageText });
    
    const options = {
        hostname: 'api.wolvesville.com',
        path: `/clans/${CLAN_ID}/chat`,
        method: 'POST',
        headers: {
            'Authorization': `Bot ${API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = https.request(options, (res) => {
        res.on('data', () => {});
        res.on('end', () => console.log(`✨ Welcome message successfully sent to the clan chat!`));
    });
    req.write(data);
    req.end();
}

function checkMembers() {
    const options = {
        hostname: 'api.wolvesville.com',
        path: `/clans/search?name=${encodeURIComponent("Dz|Asl")}`,
        headers: { 
            'Authorization': `Bot ${API_KEY}`,
            'Accept': 'application/json'
        }
    };

    https.get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const clans = JSON.parse(data);
                if (clans && clans.length > 0) {
                    const clan = clans.find(c => c.id === CLAN_ID) || clans[0];
                    console.log(`✅ Clan: ${clan.name} | Members Count: ${clan.memberCount}`);
                    
                    if (previousCount !== null) {
                        if (clan.memberCount > previousCount) {
                            console.log(`🎉 New member joined! Previous: ${previousCount}, Current: ${clan.memberCount}`);
                            sendWelcomeMessage();
                        }
                    }
                    previousCount = clan.memberCount;
                }
            } catch (e) {
                console.error('Error parsing data:', e.message);
            }
        });
    }).on('error', (err) => {
        console.error('Request error:', err.message);
    });
}

setTimeout(() => {
    console.log('Bot is active and monitoring member count changes...');
    checkMembers();
    setInterval(checkMembers, 5000);
}, 2000);
