require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {

    console.clear();

    console.log(`
╔════════════════════════════════════╗
║         MOONLIGHT HUB BOT          ║
╠════════════════════════════════════╣
║ 🤖 Bot    : ${client.user.tag}
║ 🌍 Guild  : ${client.guilds.cache.size}
║ 📡 Ping   : ${client.ws.ping}ms
║ ✅ Status : Online
╚════════════════════════════════════╝
`);

    const updatePresence = () => {

        const guilds = client.guilds.cache.size;

        const members = client.guilds.cache.reduce(
            (total, guild) => total + (guild.memberCount || 0),
            0
        );

        const uptime = Math.floor(client.uptime / 1000);

        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        const activities = [
            `🌙 Moonlight Hub`,
            `🌍 ${guilds} Server`,
            `👥 ${members} Member`,
            `⏱️ ${hours}h ${minutes}m Uptime`,
            `🚀 /help`
        ];

        const activity =
            activities[Math.floor(Math.random() * activities.length)];

        client.user.setPresence({
            activities: [{
                name: activity,
                type: ActivityType.Watching
            }],
            status: 'online'
        });
    };

    updatePresence();

    setInterval(updatePresence, 15000); // ganti tiap 15 detik
});

client.login(process.env.TOKEN);