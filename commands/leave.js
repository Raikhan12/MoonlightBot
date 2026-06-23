const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    EmbedBuilder
} = require('discord.js');

const Leave =
    require('../models/Leave');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave System')

        .addSubcommand(sub =>
            sub
                .setName('setup')
                .setDescription('Setup leave channel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel leave')
                        .addChannelTypes(
                            ChannelType.GuildText
                        )
                        .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName('test')
                .setDescription('Test leave')
        )

        .addSubcommand(sub =>
            sub
                .setName('disable')
                .setDescription('Disable leave')
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

            await Leave.findOneAndUpdate(
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
                    `✅ Leave channel diatur ke ${channel}`
            });

        }

        if (sub === 'disable') {

            await Leave.findOneAndDelete({
                guildId:
                    interaction.guild.id
            });

            return interaction.reply({
                content:
                    '✅ Leave berhasil dinonaktifkan'
            });

        }

        if (sub === 'test') {

            const data =
                await Leave.findOne({
                    guildId:
                        interaction.guild.id
                });

            if (!data) {

                return interaction.reply({
                    content:
                        '❌ Leave belum disetup',
                    ephemeral: true
                });

            }

            const channel =
                interaction.guild.channels.cache.get(
                    data.channelId
                );

            if (!channel) {

                return interaction.reply({
                    content:
                        '❌ Channel tidak ditemukan',
                    ephemeral: true
                });

            }

            const embed =
                new EmbedBuilder()
                    .setColor('#7f5af0')
                    .setAuthor({
                        name: '🌙 Member Keluar (Test)',
                        iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.user.displayAvatarURL()
                    })
                    .setDescription(
                        `**${interaction.user.tag}** baru saja meninggalkan server.`
                    )
                    .setThumbnail(
                        interaction.user.displayAvatarURL()
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Moonlight Hub • Sampai Jumpa 👋' });

            await channel.send({
                embeds: [embed]
            });

            return interaction.reply({
                content:
                    '✅ Test leave berhasil dikirim'
            });

        }

    }

};