const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick member')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Member')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Alasan')
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.KickMembers
        ),

    async execute(interaction) {

        const member =
            interaction.options.getMember(
                'user'
            );

        const reason =
            interaction.options.getString(
                'reason'
            ) || 'Tidak ada alasan';

        if (!member) {
            return interaction.reply({
                content: '❌ Member tidak ditemukan',
                ephemeral: true
            });
        }

        await member.kick(reason);

        const embed =
            new EmbedBuilder()
                .setColor('#7f5af0')
                .setAuthor({
                    name: '🌙 Moonlight Hub • Moderation',
                    iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
                })
                .setTitle('👢 Member Berhasil Dikick')
                .setDescription(`**User:** ${member.user} (${member.user.tag})\n**User ID:** \`${member.id}\``)
                .addFields({
                    name: '📄 Alasan',
                    value: reason
                })
                .setTimestamp()
                .setFooter({ text: `Moderator: ${interaction.user.username} 🌙` });

        await interaction.reply({
            embeds: [embed]
        });

    }

};