const https = require('https');
const http = require('http');

const BOT_ID = process.env.BOT_ID;
const API_KEY = process.env.API_KEY;
const CLAN_NAME = process.env.CLAN_NAME || "Asl"; // اسم كلانك الصريح
const PORT = process.env.PORT || 3000;

console.log('Starting Wolvesville bot...');

// خادم الويب الوهمي لمنصة Render
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running successfully!');
}).listen(PORT, () => {
    console.log(`Dummy HTTP server is listening on port ${PORT}`);
});

// دالة البحث المباشر عن الكلان بالاسم وتفادي أخطاء 404
function checkNewMembers() {
    const options = {
        hostname: 'api.wolvesville.com',
        path: `/clans/search?name=${encodeURIComponent(CLAN_NAME)}`,
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
                if (Array.isArray(clans) && clans.length > 0) {
                    // ابحث عن كلانك بالتحديد من النتائج
                    const myClan = clans.find(c => c.name.toLowerCase() === CLAN_NAME.toLowerCase()) || clans[0];
                    console.log(`Clan Found -> Name: ${myClan.name} | Members: ${myClan.memberCount} | XP: ${myClan.xp}`);
                } else {
                    console.log('Clan search returned empty results.');
                }
            } catch (e) {
                console.error('Parse error:', e.message);
            }
        });
    }).on('error', (err) => {
        console.error('Connection error:', err.message);
    });
}

// تشغيل الفحص المستمر
setTimeout(() => {
    console.log('Bot is connected and ready!');
    checkNewMembers();
    setInterval(checkNewMembers, 10000);
}, 2000);
            
