const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const AutoRole = require('../../models/AutoRole');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Auto Role System')
        .addSubcommand(sub =>
            sub
                .setName('setup')
                .setDescription('Setup auto role when member joins')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to assign')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('info')
                .setDescription('Show current auto role info')
        )
        .addSubcommand(sub =>
            sub
                .setName('disable')
                .setDescription('Disable auto role')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'setup') {
            const role = interaction.options.getRole('role');

            await AutoRole.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { guildId: interaction.guild.id, roleId: role.id },
                { upsert: true }
            );

            return interaction.reply({
                content: `✅ Auto Role diatur ke ${role}`
            });
        }

        if (sub === 'disable') {
            await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });

            return interaction.reply({
                content: '✅ Auto Role berhasil dinonaktifkan'
            });
        }

        if (sub === 'info') {
            const data = await AutoRole.findOne({ guildId: interaction.guild.id });

            if (!data) {
                return interaction.reply({
                    content: '❌ Auto Role belum disetup',
                    ephemeral: true
                });
            }

            const role = interaction.guild.roles.cache.get(data.roleId);

            if (!role) {
                return interaction.reply({
                    content: '❌ Role tidak ditemukan di server ini',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setAuthor({
                    name: '🌙 Moonlight Hub • Auto Role Info',
                    iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
                })
                .setDescription(`Auto Role saat member bergabung dikonfigurasi sebagai berikut:\n\n👥 **Role Aktif:** ${role}\n🔑 **Role ID:** \`${role.id}\``)
                .setTimestamp()
                .setFooter({ text: 'Moonlight Hub • Auto Role System 🌙' });

            return interaction.reply({
                embeds: [embed]
            });
        }
    }
};
