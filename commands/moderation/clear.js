const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Hapus pesan')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Jumlah pesan')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        ),

    async execute(interaction) {

        const amount =
            interaction.options.getInteger(
                'amount'
            );

        await interaction.channel.bulkDelete(
            amount,
            true
        );

        await interaction.reply({
            content:
                `🗑️ Menghapus ${amount} pesan`,
            ephemeral: true
        });

    }

};