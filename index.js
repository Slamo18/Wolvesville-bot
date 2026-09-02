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
                console.log('Clan Data Fetched:', clanData);
            } catch (e) {
                console.error('Error parsing clan data:', e);
            }
        });
    }).on('error', (err) => {
        console.error('Connection error:', err);
    });
}
