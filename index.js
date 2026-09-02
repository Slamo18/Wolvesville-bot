const { Client } = require('wolvesville-api');

// استخدام متغيرات البيئة للأمان التام
const client = new Client({
    botId: process.env.BOT_ID,
    apiKey: process.env.API_KEY
});

// الحدث الذي يعمل عندما ينضم عضو جديد للكلان
client.on('clanMemberAdd', async (member) => {
    try {
        const welcomeMessage = `مرحبا بيك يا ${member.username} في العائلة! نورتنا 🔥`;
        await member.sendClanChatMessage(welcomeMessage);
        console.log(`تم ترحيب العضو: ${member.username}`);
    } catch (error) {
        console.error('حدث خطأ أثناء إرسال الترحيب:', error);
    }
});

client.login().then(() => {
    console.log('البوت متصل بنجاح وجاهز للعمل!');
}).catch(err => {
    console.error('فشل تسجيل الدخول:', err);
});
