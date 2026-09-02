const https = require('https');
const http = require('http');

const BOT_ID = process.env.BOT_ID;
const API_KEY = process.env.API_KEY;
const CLAN_ID = process.env.CLAN_ID;
const PORT = process.env.PORT || 3000;

console.log('Starting Wolvesville bot...');

// خادم الويب الوهمي لإرضاء Render
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running successfully!');
}).listen(PORT, () => {
    console.log(`Dummy HTTP server is listening on port ${PORT}`);
});

// دالة الفحص الآمنة
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

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log('API Response:', JSON.stringify(json, null, 2));
            } catch (e) {
                console.error('Parse error:', e.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Request error:', error.message);
    });

    req.end();
}

// تشغيل البوت بشكل مستقر
setTimeout(() => {
    console.log('Bot is connected and ready!');
    checkNewMembers();
    setInterval(checkNewMembers, 10000);
}, 2000);
