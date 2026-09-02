const https = require('https');
const http = require('http');

const BOT_ID = process.env.BOT_ID;
const API_KEY = process.env.API_KEY;
const CLAN_ID = process.env.CLAN_ID; // تأكد أنه موجود في متغيرات Render
const CLAN_NAME = process.env.CLAN_NAME || "Asl";
const PORT = process.env.PORT || 3000;

let previousMemberCount = null; // لتخزين عدد الأعضاء ومقارنته

console.log('Starting Wolvesville bot...');

// خادم الويب الوهمي لإرضاء Render
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running successfully!');
}).listen(PORT, () => {
    console.log(`Dummy HTTP server is listening on port ${PORT}`);
});

// دالة إرسال رسالة ترحيبية في شات الكلان
function sendWelcomeMessage() {
    if (!CLAN_ID) return;

    const messageText = "Welcome to Asl clan! 🎉 Glad to have you with us. Stay active and enjoy the game!";
    const data = JSON.stringify({ message: messageText });
    
    const options = {
        hostname: 'api.wolvesville.com',
        path: `/clans/${encodeURIComponent(CLAN_ID)}/chat`,
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
            console.log('Welcome message sent successfully:', responseBody);
        });
    });

    req.on('error', (error) => {
        console.error('Error sending welcome message:', error.message);
    });

    req.write(data);
    req.end();
}

// دالة فحص الكلان ومراقبة انضمام الأعضاء الجدد
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
                    const myClan = clans.find(c => c.name.toLowerCase() === CLAN_NAME.toLowerCase()) || clans[0];
                    
                    console.log(`Clan Found -> Name: ${myClan.name} | Members: ${myClan.memberCount} | XP: ${myClan.xp}`);

                    // التحقق مما إذا كان هناك عضو جديد قد انضم
                    if (previousMemberCount !== null) {
                        if (myClan.memberCount > previousMemberCount) {
                            console.log('New member detected! Sending welcome message...');
                            sendWelcomeMessage();
                        }
                    }
                    
                    // تحديث العدد الحالي للمقارنة في المرة القادمة
                    previousMemberCount = myClan.memberCount;
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

// تشغيل البوت وبدء الفحص كل 10 ثوانٍ
setTimeout(() => {
    console.log('Bot is connected and ready!');
    checkNewMembers();
    setInterval(checkNewMembers, 10000);
}, 2000);
        
