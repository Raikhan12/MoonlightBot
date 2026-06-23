const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Cek latency bot'),

    async execute(interaction) {

        const sent = await interaction.reply({
            content: '🌙 Calculating Moonlight latency...',
            fetchReply: true
        });

        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor('#0f172a') // moonlight dark
            .setAuthor({
                name: '🌙 Moonlight Hub • Ping',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setDescription(
                `🏓 **Pong! Connection Status**\n\n` +
                `⚡ **Bot Latency** : \`${latency}ms\`\n` +
                `🌐 **API Latency** : \`${apiLatency}ms\`\n\n` +
                `✨ Status: **Stable**`
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.editReply({
            content: null,
            embeds: [embed]
        });
    }

};