const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Kirim panel verifikasi.')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Role yang akan diberikan')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        const role = interaction.options.getRole('role');

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('✅ Moonlight Hub Verification')
            .setDescription(
                `Klik tombol di bawah untuk mendapatkan role ${role}.`
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`verify_${role.id}`)
                .setLabel('Verify')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
        );

        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: '✅ Panel verifikasi berhasil dikirim.',
            ephemeral: true
        });
    }
};