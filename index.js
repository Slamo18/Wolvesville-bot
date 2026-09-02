// Function to check clan details directly by name
function checkNewMembers() {
    if (!CLAN_NAME) {
        console.log('Error: CLAN_NAME is missing in environment variables.');
        return;
    }

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
                const result = JSON.parse(data);
                console.log('Clan search result:', result);
            } catch (e) {
                console.error('Error parsing clan data:', e);
            }
        });
    }).on('error', (err) => {
        console.error('Connection error:', err);
    });
}
