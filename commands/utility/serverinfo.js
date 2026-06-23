const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Menampilkan dashboard server'),

    async execute(interaction) {

        const guild = interaction.guild;
        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setColor('#0f172a')
            .setAuthor({
                name: '🌙 Moonlight Hub • Server Dashboard',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTitle(`✨ ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))

            // ===== CORE STATS =====
            .addFields(
                {
                    name: '👑 Owner',
                    value: `${owner.user.tag}`,
                    inline: true
                },
                {
                    name: '🆔 Server ID',
                    value: `${guild.id}`,
                    inline: true
                },
                {
                    name: '📅 Created',
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
                    inline: true
                },

                // ===== MEMBERS =====
                {
                    name: '👥 Members',
                    value:
                        `Total: **${guild.memberCount}**`,
                    inline: true
                },
                {
                    name: '💬 Channels',
                    value: `**${guild.channels.cache.size}**`,
                    inline: true
                },
                {
                    name: '📊 Roles',
                    value: `**${guild.roles.cache.size}**`,
                    inline: true
                },

                // ===== SERVER STATUS =====
                {
                    name: '💎 Boost Level',
                    value: `Level **${guild.premiumTier}** (${guild.premiumSubscriptionCount || 0} boosts)`,
                    inline: true
                },
                {
                    name: '🛡️ Verification',
                    value: `${guild.verificationLevel}`,
                    inline: true
                },
                {
                    name: '🎨 Features',
                    value: guild.features.length
                        ? guild.features.map(f => `\`${f}\``).join(', ')
                        : 'None',
                    inline: false
                }
            )

            // ===== FOOTER =====
            .setFooter({
                text: `Moonlight Hub • Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};