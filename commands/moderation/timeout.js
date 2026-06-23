const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout member')

        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Member')
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName('minutes')
                .setDescription('Durasi menit')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Alasan')
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),

    async execute(interaction) {

        const member =
            interaction.options.getMember(
                'user'
            );

        const minutes =
            interaction.options.getInteger(
                'minutes'
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

        await member.timeout(
            minutes * 60 * 1000,
            reason
        );

        const embed =
            new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('⏳ Member Timeout')
                .setDescription(
                    `${member.user.tag}`
                )
                .addFields(
                    {
                        name: 'Durasi',
                        value: `${minutes} menit`
                    },
                    {
                        name: 'Reason',
                        value: reason
                    }
                );

        await interaction.reply({
            embeds: [embed]
        });

    }

};