const https = require('https');
const http = require('http');

const BOT_ID = process.env.BOT_ID;
const API_KEY = process.env.API_KEY;
const CLAN_ID = process.env.CLAN_ID || "cc381093-ddbd-48f7-aea1-1740959a2ce7";
const PORT = process.env.PORT || 3000;

let previousMembers = null;

http.createServer((req, res) => res.end('OK')).listen(PORT);

function sendWelcomeMessage(newMemberName) {
    if (!CLAN_ID) return;

    const messageText = `🐺 Welcome to Asl! 🎉 Glad to have you, ${newMemberName}.\n📌 Please contribute 200 Gold as an entry fee. Enjoy! 🚀`;
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
        res.on('end', () => console.log(`Welcome sent to ${newMemberName}!`));
    });
    req.write(data);
    req.end();
}

function checkMembers() {
    const options = {
        hostname: 'api.wolvesville.com',
        path: `/clans/${CLAN_ID}`,
        headers: { 
            'Authorization': `Bot ${API_KEY}`,
            'Accept': 'application/json'
        }
    };

    https.get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log(`[API Response Status]: ${res.statusCode}`);
            console.log(`[API Response Data]: ${data.substring(0, 150)}...`); // طباعة أول جزء من الرد لنفحصه
            try {
                const clan = JSON.parse(data);
                if (clan && clan.id) {
                    console.log(`✅ Success! Clan: ${clan.name} | Members Count: ${clan.memberCount}`);
                    
                    if (clan.members) {
                        const currentMembersMap = new Map(clan.members.map(m => [m.id, m.username]));
                        
                        if (previousMembers !== null) {
                            for (let [id, username] of currentMembersMap) {
                                if (!previousMembers.has(id)) {
                                    console.log(`New member detected: ${username}`);
                                    sendWelcomeMessage(username);
                                    break;
                                }
                            }
                        }
                        previousMembers = currentMembersMap;
                    }
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
    console.log('Bot is active and polling clan members...');
    checkMembers();
    setInterval(checkMembers, 5000);
}, 2000);
