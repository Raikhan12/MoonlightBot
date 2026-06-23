const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const ReactionRole = require('../../models/ReactionRole');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Reaction Role System')

        .addSubcommand(s =>
            s
                .setName('create')
                .setDescription('Create reaction role panel')
        )

        .addSubcommand(s =>
            s
                .setName('add')
                .setDescription('Add role to reaction role')
                .addStringOption(o =>
                    o.setName('messageid')
                        .setDescription('Message ID')
                        .setRequired(true)
                )
                .addRoleOption(o =>
                    o.setName('role')
                        .setDescription('Role')
                        .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('emoji')
                        .setDescription('Emoji')
                        .setRequired(true)
                )
        )

        .addSubcommand(s =>
            s
                .setName('remove')
                .setDescription('Remove role from reaction role')
                .addStringOption(o =>
                    o.setName('messageid')
                        .setDescription('Message ID')
                        .setRequired(true)
                )
                .addRoleOption(o =>
                    o.setName('role')
                        .setDescription('Role')
                        .setRequired(true)
                )
        )

        .addSubcommand(s =>
            s
                .setName('delete')
                .setDescription('Delete reaction role system')
        )

        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        /* ================= CREATE PANEL ================= */
        if (sub === 'create') {
            const embed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setTitle('🌙 Moonlight Hub • Reaction Roles')
                .setDescription('Dapatkan role dengan mereaksi emoji di bawah ini!\n\n*Belum ada role yang dikonfigurasi.*')
                .setTimestamp()
                .setFooter({ text: 'Moonlight Hub • Reaction Role Panel 🌙' });

            const msg = await interaction.channel.send({ embeds: [embed] });

            await ReactionRole.create({
                guildId: interaction.guild.id,
                channelId: interaction.channel.id,
                messageId: msg.id,
                roles: []
            });

            return interaction.reply({
                content: '✅ Panel reaction role berhasil dibuat.',
                ephemeral: true
            });
        }

        /* ================= ADD ROLE ================= */
        if (sub === 'add') {
            const messageId = interaction.options.getString('messageid');
            const role = interaction.options.getRole('role');
            const emoji = interaction.options.getString('emoji');

            const data = await ReactionRole.findOne({
                guildId: interaction.guild.id,
                messageId
            });

            if (!data) {
                return interaction.reply({
                    content: '❌ Panel tidak ditemukan.',
                    ephemeral: true
                });
            }

            // check if emoji already exists in this panel
            const duplicateEmoji = data.roles.find(r => r.emoji === emoji);
            if (duplicateEmoji) {
                return interaction.reply({
                    content: '❌ Emoji tersebut sudah digunakan di panel ini.',
                    ephemeral: true
                });
            }

            // check if role already exists in this panel
            const duplicateRole = data.roles.find(r => r.roleId === role.id);
            if (duplicateRole) {
                return interaction.reply({
                    content: '❌ Role tersebut sudah digunakan di panel ini.',
                    ephemeral: true
                });
            }

            /* simpan role + emoji ke database */
            data.roles.push({
                roleId: role.id,
                emoji
            });

            await data.save();

            /* ambil message dari channel panel */
            const channel = await interaction.guild.channels.fetch(data.channelId).catch(() => null);
            if (!channel) {
                return interaction.reply({
                    content: '❌ Channel panel tidak ditemukan.',
                    ephemeral: true
                });
            }

            const msg = await channel.messages.fetch(messageId).catch(() => null);
            if (!msg) {
                return interaction.reply({
                    content: '❌ Pesan panel tidak ditemukan.',
                    ephemeral: true
                });
            }

            /* kasih reaction ke message */
            await msg.react(emoji).catch(err => {
                console.error('Failed to react:', err);
            });

            /* update embed */
            const list = data.roles.map(r => `${r.emoji} : <@&${r.roleId}>`).join('\n');
            const embed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setTitle('🌙 Moonlight Hub • Reaction Roles')
                .setDescription(`Dapatkan role dengan mereaksi emoji di bawah ini!\n\n${list}`)
                .setTimestamp()
                .setFooter({ text: 'Moonlight Hub • Reaction Role Panel 🌙' });

            await msg.edit({ embeds: [embed] });

            return interaction.reply({
                content: `✅ Role ${role} dengan emoji ${emoji} berhasil ditambahkan ke panel.`,
                ephemeral: true
            });
        }

        /* ================= REMOVE ROLE ================= */
        if (sub === 'remove') {
            const messageId = interaction.options.getString('messageid');
            const role = interaction.options.getRole('role');

            const data = await ReactionRole.findOne({
                guildId: interaction.guild.id,
                messageId
            });

            if (!data) {
                return interaction.reply({
                    content: '❌ Data tidak ditemukan.',
                    ephemeral: true
                });
            }

            const targetRole = data.roles.find(r => r.roleId === role.id);
            if (!targetRole) {
                return interaction.reply({
                    content: '❌ Role tersebut tidak ada di panel ini.',
                    ephemeral: true
                });
            }

            const emojiToRemove = targetRole.emoji;

            /* hapus role dari array */
            data.roles = data.roles.filter(r => r.roleId !== role.id);
            await data.save();

            const channel = await interaction.guild.channels.fetch(data.channelId).catch(() => null);
            if (channel) {
                const msg = await channel.messages.fetch(messageId).catch(() => null);
                if (msg) {
                    // Try removing the reaction from the bot
                    const parsedEmoji = emojiToRemove.includes(':') ? emojiToRemove.split(':')[2].replace('>', '') : emojiToRemove;
                    const reaction = msg.reactions.cache.get(parsedEmoji) || msg.reactions.cache.get(emojiToRemove);
                    if (reaction) {
                        await reaction.users.remove(interaction.client.user.id).catch(() => null);
                    }

                    /* update embed */
                    const list = data.roles.map(r => `${r.emoji} : <@&${r.roleId}>`).join('\n') || '*Belum ada role yang dikonfigurasi.*';
                    const embed = new EmbedBuilder()
                        .setColor('#7f5af0')
                        .setTitle('🌙 Moonlight Hub • Reaction Roles')
                        .setDescription(`Dapatkan role dengan mereaksi emoji di bawah ini!\n\n${list}`)
                        .setTimestamp()
                        .setFooter({ text: 'Moonlight Hub • Reaction Role Panel 🌙' });

                    await msg.edit({ embeds: [embed] });
                }
            }

            return interaction.reply({
                content: `✅ Role ${role} berhasil dihapus dari panel.`,
                ephemeral: true
            });
        }

        /* ================= DELETE ALL ================= */
        if (sub === 'delete') {
            await ReactionRole.deleteMany({
                guildId: interaction.guild.id
            });

            return interaction.reply({
                content: '🗑️ Semua data reaction role di server ini berhasil dihapus.',
                ephemeral: true
            });
        }
    }
};