const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const Ticket = require('../../models/Ticket');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket System')

        .addSubcommand(sub =>
            sub
                .setName('setup')
                .setDescription('Setup Ticket Panel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Panel Channel')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName('support')
                        .setDescription('Support Role')
                        .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName('claim')
                .setDescription('Claim Ticket')
        )

        .addSubcommand(sub =>
            sub
                .setName('close')
                .setDescription('Close Ticket')
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        /* =======================
           SETUP
        ======================= */
        if (sub === 'setup') {
            const channel = interaction.options.getChannel('channel');
            const role = interaction.options.getRole('support');

            await Ticket.findOneAndUpdate(
                { guildId: interaction.guild.id },
                {
                    guildId: interaction.guild.id,
                    channelId: channel.id,
                    supportRoleId: role.id
                },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setAuthor({
                    name: '🌙 Moonlight Hub • Ticket Support',
                    iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
                })
                .setTitle('🎫 Hubungi Dukungan Kami')
                .setDescription(
                    `Butuh bantuan? Silakan klik tombol di bawah ini untuk membuka ticket bantuan baru.\n\n` +
                    `Support team kami akan siap melayani Anda!`
                )
                .setTimestamp()
                .setFooter({
                    text: 'Moonlight Hub • Pelayanan Terbaik 🌙',
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_create')
                    .setLabel('Create Ticket')
                    .setEmoji('🎫')
                    .setStyle(ButtonStyle.Primary)
            );

            await channel.send({
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                content: `✅ Ticket panel berhasil dibuat di channel ${channel}.`,
                ephemeral: true
            });
        }

        /* =======================
           CLAIM
        ======================= */
        if (sub === 'claim') {
            const data = await Ticket.findOne({ guildId: interaction.guild.id });
            if (!data) {
                return interaction.reply({
                    content: '❌ Ticket belum di setup di server ini.',
                    ephemeral: true
                });
            }

            const hasRole = interaction.member.roles.cache.has(data.supportRoleId);
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

            if (!hasRole && !isAdmin) {
                return interaction.reply({
                    content: '❌ Hanya staff support yang dapat meng-claim ticket ini.',
                    ephemeral: true
                });
            }

            const parts = interaction.channel.name.split('-');
            const creatorId = parts[1];

            if (!creatorId) {
                return interaction.reply({
                    content: '❌ Gagal mengidentifikasi pembuat ticket dari nama channel.',
                    ephemeral: true
                });
            }

            await interaction.channel.setName(`claimed-${creatorId}`).catch(() => null);

            await interaction.channel.permissionOverwrites.set([
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: creatorId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                }
            ]).catch(() => null);

            const claimEmbed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setAuthor({
                    name: '🌙 Moonlight Hub • Ticket Claimed',
                    iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
                })
                .setDescription(`Ticket ini telah di-claim oleh ${interaction.user}.\nStaff ini yang akan membantu menyelesaikan masalahmu.`)
                .setTimestamp()
                .setFooter({ text: 'Moonlight Hub • Pelayanan Terbaik 🌙' });

            return interaction.reply({ embeds: [claimEmbed] });
        }

        /* =======================
           CLOSE
        ======================= */
        if (sub === 'close') {
            const embed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setTitle('🌙 Moonlight Hub • Closing Ticket')
                .setDescription('🔒 Ticket akan ditutup dalam 5 detik...')
                .setTimestamp()
                .setFooter({ text: 'Moonlight Hub • Pelayanan Terbaik 🌙' });

            await interaction.reply({ embeds: [embed] });

            setTimeout(async () => {
                await interaction.channel.delete().catch(() => null);
            }, 5000);
        }
    }
};