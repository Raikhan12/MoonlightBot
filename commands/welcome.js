const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    EmbedBuilder
} = require('discord.js');

const Welcome =
    require('../models/Welcome');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Welcome System')

        .addSubcommand(sub =>
            sub
                .setName('setup')
                .setDescription('Setup welcome')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Welcome channel')
                        .addChannelTypes(
                            ChannelType.GuildText
                        )
                        .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName('test')
                .setDescription('Test welcome')
        )

        .addSubcommand(sub =>
            sub
                .setName('disable')
                .setDescription('Disable welcome')
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        const sub =
            interaction.options.getSubcommand();

        if (sub === 'setup') {

            const channel =
                interaction.options.getChannel(
                    'channel'
                );

            await Welcome.findOneAndUpdate(
                {
                    guildId:
                        interaction.guild.id
                },
                {
                    guildId:
                        interaction.guild.id,
                    channelId:
                        channel.id,
                    enabled: true
                },
                {
                    upsert: true
                }
            );

            return interaction.reply({
                content:
                    `✅ Welcome diatur ke ${channel}`
            });
        }

        if (sub === 'disable') {

            await Welcome.findOneAndDelete({
                guildId:
                    interaction.guild.id
            });

            return interaction.reply({
                content:
                    '✅ Welcome dinonaktifkan'
            });
        }

        if (sub === 'test') {

            const data =
                await Welcome.findOne({
                    guildId:
                        interaction.guild.id
                });

            if (!data)
                return interaction.reply({
                    content:
                        '❌ Welcome belum disetup',
                    ephemeral: true
                });

            const channel =
                interaction.guild.channels.cache.get(
                    data.channelId
                );

            if (!channel)
                return interaction.reply({
                    content:
                        '❌ Channel tidak ditemukan',
                    ephemeral: true
                });

            const embed =
                new EmbedBuilder()
                    .setColor('#7f5af0')
                    .setAuthor({
                        name: `🌙 Welcome to ${interaction.guild.name}!`,
                        iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.user.displayAvatarURL()
                    })
                    .setDescription(
                        `Selamat datang ${interaction.user} di **${interaction.guild.name}**!\nKamu adalah member ke-**${interaction.guild.memberCount}**.`
                    )
                    .setThumbnail(
                        interaction.user.displayAvatarURL()
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Moonlight Hub • Selamat Datang! 🌙' });

            await channel.send({
                embeds: [embed]
            });

            return interaction.reply({
                content:
                    '✅ Test welcome dikirim'
            });
        }

    }
};