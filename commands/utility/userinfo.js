const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Menampilkan informasi user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Pilih user')
        ),

    async execute(interaction) {

        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const embed = new EmbedBuilder()
            .setColor('#0f172a') // moonlight dark premium
            .setAuthor({
                name: '🌙 Moonlight Hub • User Dashboard',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTitle(`${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))

            // ===== CORE INFO =====
            .addFields(
                {
                    name: '🆔 User ID',
                    value: `${user.id}`,
                    inline: true
                },
                {
                    name: '📅 Account Created',
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
                    inline: true
                },
                {
                    name: '🤖 Bot?',
                    value: user.bot ? 'Yes 🤖' : 'No 👤',
                    inline: true
                }
            )

            // ===== SERVER INFO (if in guild) =====
            .addFields(
                {
                    name: '📥 Joined Server',
                    value: member
                        ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
                        : 'Not in server',
                    inline: true
                },
                {
                    name: '🎭 Roles',
                    value: member
                        ? `${member.roles.cache.size - 1} roles`
                        : 'No data',
                    inline: true
                },
                {
                    name: '📊 Status',
                    value: member
                        ? `${member.presence?.status || 'offline'}`
                        : 'Unknown',
                    inline: true
                }
            )

            // ===== FOOTER =====
            .setFooter({
                text: `Requested by ${interaction.user.tag} • Moonlight Hub`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};