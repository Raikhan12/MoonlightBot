const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const Warn = require('../../models/Warn');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn Management System')
        .addSubcommand(sub =>
            sub
                .setName('add')
                .setDescription('Warn a member')
                .addUserOption(option =>
                    option.setName('user').setDescription('The member to warn').setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('reason').setDescription('The reason for warning').setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('list')
                .setDescription('Show warning history for a user')
                .addUserOption(option =>
                    option.setName('user').setDescription('The member to check').setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('clear')
                .setDescription('Clear all warnings for a user')
                .addUserOption(option =>
                    option.setName('user').setDescription('The member to clear warnings for').setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('remove')
                .setDescription('Remove a specific warning by index')
                .addUserOption(option =>
                    option.setName('user').setDescription('The member whose warning to remove').setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('index').setDescription('The warning index (1-based) to remove').setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');

        if (sub === 'add') {
            const reason = interaction.options.getString('reason');

            await Warn.create({
                guildId: interaction.guild.id,
                userId: user.id,
                moderatorId: interaction.user.id,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setAuthor({
                    name: '🌙 Moonlight Hub • Warning System',
                    iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
                })
                .setTitle('⚠️ Member Warned')
                .setDescription(`Mendapatkan peringatan baru: **${user.tag}** (${user.id})`)
                .addFields(
                    { name: '👤 Moderator', value: `${interaction.user}`, inline: true },
                    { name: '📄 Alasan', value: reason, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Moonlight Hub • Peringatan Server 🌙' });

            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'list') {
            const warnings = await Warn.find({
                guildId: interaction.guild.id,
                userId: user.id
            }).sort({ createdAt: 1 });

            if (warnings.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#7f5af0')
                    .setAuthor({
                        name: '🌙 Moonlight Hub • Warning System',
                        iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
                    })
                    .setDescription(`✅ **${user.tag}** bersih, tidak ada riwayat peringatan.`);
                return interaction.reply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setAuthor({
                    name: `🌙 Moonlight Hub • Peringatan ${user.username}`,
                    iconURL: user.displayAvatarURL({ dynamic: true })
                })
                .setDescription(`Ditemukan **${warnings.length}** peringatan untuk ${user}:`)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.username} • Moonlight Hub 🌙` });

            warnings.forEach((warn, index) => {
                const date = warn.createdAt ? new Date(warn.createdAt).toLocaleDateString('id-ID') : 'Unknown';
                embed.addFields({
                    name: `Peringatan #${index + 1}`,
                    value: `📅 **Tanggal:** ${date}\n👤 **Moderator:** <@${warn.moderatorId}>\n📄 **Alasan:** ${warn.reason}`
                });
            });

            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'clear') {
            const result = await Warn.deleteMany({
                guildId: interaction.guild.id,
                userId: user.id
            });

            const embed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setAuthor({
                    name: '🌙 Moonlight Hub • Warning System',
                    iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
                })
                .setDescription(`🧹 Berhasil menghapus **semua (${result.deletedCount})** peringatan untuk **${user.tag}**.`);

            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'remove') {
            const index = interaction.options.getInteger('index');
            const warnings = await Warn.find({
                guildId: interaction.guild.id,
                userId: user.id
            }).sort({ createdAt: 1 });

            if (index < 1 || index > warnings.length) {
                return interaction.reply({
                    content: `❌ Index tidak valid. Pilih antara 1 sampai ${warnings.length}.`,
                    ephemeral: true
                });
            }

            const targetWarn = warnings[index - 1];
            await Warn.findByIdAndDelete(targetWarn._id);

            const embed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setAuthor({
                    name: '🌙 Moonlight Hub • Warning System',
                    iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
                })
                .setDescription(`✅ Berhasil menghapus peringatan **#${index}** untuk **${user.tag}**.\n\n` +
                                `📄 **Alasan sebelumnya:** ${targetWarn.reason}`);

            return interaction.reply({ embeds: [embed] });
        }
    }
};