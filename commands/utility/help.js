const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Menampilkan semua menu bantuan dan command Moonlight Hub'),

    async execute(interaction) {
        const { client } = interaction;
        
        // Define category maps
        const categories = {
            '🛡️ Moderation': ['ban', 'kick', 'timeout', 'verify', 'warn'],
            '🎭 Role Management': ['autorole', 'reactionrole'],
            '🎫 Ticket System': ['ticket'],
            '👋 Welcome & Leave': ['welcome', 'leave'],
            '⚙️ Utility & Info': ['avatar', 'help', 'ping', 'say', 'serverinfo', 'userinfo']
        };

        const embed = new EmbedBuilder()
            .setColor('#7f5af0')
            .setAuthor({
                name: '🌙 Moonlight Hub • Help Menu',
                iconURL: client.user.displayAvatarURL()
            })
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(
                `Selamat datang di menu bantuan **Moonlight Hub**!\n` +
                `Berikut adalah daftar lengkap perintah slash yang tersedia.`
            )
            .setTimestamp()
            .setFooter({
                text: `Requested by ${interaction.user.username} • Moonlight Hub 🌙`,
                iconURL: interaction.user.displayAvatarURL()
            });

        for (const [catName, cmdNames] of Object.entries(categories)) {
            const list = [];
            for (const name of cmdNames) {
                const cmd = client.commands.get(name);
                if (cmd) {
                    list.push(`\`/${cmd.data.name}\` - ${cmd.data.description}`);
                }
            }
            if (list.length > 0) {
                embed.addFields({
                    name: catName,
                    value: list.join('\n')
                });
            }
        }

        await interaction.reply({
            embeds: [embed]
        });
    }

};