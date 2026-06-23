const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Menampilkan avatar user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Pilih user')
        ),

    async execute(interaction) {

        const user = interaction.options.getUser('user') || interaction.user;

        const avatarURL = user.displayAvatarURL({
            size: 4096,
            dynamic: true
        });

        const embed = new EmbedBuilder()
            .setColor('#1e1b4b') // deep moonlight purple
            .setAuthor({
                name: 'Moonlight Hub',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setDescription(
                `✨ **Avatar Viewer**\n` +
                `Menampilkan avatar dari <@${user.id}>`
            )
            .setImage(avatarURL)
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }

};