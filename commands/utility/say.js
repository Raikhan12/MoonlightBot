const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Bot mengirim pesan sesuai input kamu')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Gunakan | untuk baris baru')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {

        let msg = interaction.options.getString('message');

        if (!msg) {
            return interaction.reply({
                content: '❌ Pesan tidak boleh kosong',
                ephemeral: true
            });
        }

        // 🔥 MULTI LINE SUPPORT (| jadi enter)
        msg = msg
            .split('|')
            .map(text => text.trim())
            .join('\n');

        // safety anti mention abuse
        const cleanMessage = msg
            .replace(/@everyone/g, '@\u200beveryone')
            .replace(/@here/g, '@\u200bhere');

        await interaction.channel.send({
            content: cleanMessage
        });

        return interaction.reply({
            content: '✅ Pesan berhasil dikirim',
            ephemeral: true
        });
    }
};