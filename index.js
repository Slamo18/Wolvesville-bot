    const https = require('https');
const http = require('http');

const API_KEY = process.env.API_KEY;
const CLAN_ID = process.env.CLAN_ID;
const CLAN_NAME = process.env.CLAN_NAME || "Asl";
const PORT = process.env.PORT || 3000;

let previousMembers = null; // لتخزين الأعضاء ومقارنتهم

// تشغيل سيرفر وهمي لإرضاء Render
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
        path: `/clans/search?name=${encodeURIComponent(CLAN_NAME)}`,
        headers: { 'Authorization': `Bot ${API_KEY}` }
    };

    https.get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const clans = JSON.parse(data);
                if (clans && clans.length > 0) {
                    const clan = clans[0];
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
            } catch (e) {}
        });
    });
}

// فحص الكلان كل 5 ثوانٍ بدقة عالية
setInterval(checkMembers, 5000);
