const https = require('https');
const http = require('http');

const API_KEY = process.env.API_KEY;
const CLAN_ID = process.env.CLAN_ID || "cc381093-ddbd-48f7-aea1-1740959a2ce7";
const PORT = process.env.PORT || 3000;

let previousMembers = null;

http.createServer((req, res) => res.end('OK')).listen(PORT);

function sendWelcomeMessage(newMemberName) {
    const messageText = `🐺 Welcome to Dz|Asl! 🎉 Glad to have you, ${newMemberName}.\n📌 Please contribute 200 Gold as an entry fee. Enjoy! 🚀`;
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
        res.on('end', () => console.log(`✨ Welcome message successfully sent to ${newMemberName}!`));
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
            try {
                const clan = JSON.parse(data);
                if (clan && clan.id && clan.members) {
                    console.log(`✅ Clan: ${clan.name} | Members Fetched: ${clan.members.length}`);
                    
                    const currentMembersMap = new Map(clan.members.map(m => [m.id, m.username]));
                    
                    if (previousMembers !== null) {
                        for (let [id, username] of currentMembersMap) {
                            if (!previousMembers.has(id)) {
                                console.log(`🎉 New member detected: ${username}`);
                                sendWelcomeMessage(username);
                                break;
                            }
                        }
                    }
                    previousMembers = currentMembersMap;
                } else {
                    console.log('⚠️ Waiting for leader privileges / members list...');
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
    console.log('Bot is active and monitoring clan with Leader access...');
    checkMembers();
    setInterval(checkMembers, 5000);
}, 2000);
                            
