require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const discordTranscripts = require('discord-html-transcripts');

const {
    Client,
    Collection,
    GatewayIntentBits,
    ActivityType,
    REST,
    Routes,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    PermissionFlagsBits,
    Partials
} = require('discord.js');

/* ===========================
   CLIENT
=========================== */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

client.commands = new Collection();

/* ===========================
   MODELS (OPTIONAL SAFE)
=========================== */
let Welcome, Leave, Ticket, AutoRole, ReactionRole;

try { Welcome = require('./models/Welcome'); } catch {}
try { Leave = require('./models/Leave'); } catch {}
try { Ticket = require('./models/Ticket'); } catch {}
try { AutoRole = require('./models/AutoRole'); } catch {}
try { ReactionRole = require('./models/ReactionRole'); } catch {}

/* ===========================
   ERROR STORAGE
=========================== */
const errorList = [];

/* ===========================
   COMMAND LOADER
=========================== */
const commandsPath = path.join(__dirname, 'commands');

function loadCommands(dir) {

    const files = fs.readdirSync(dir);

    for (const file of files) {

        const filePath = path.join(dir, file);

        if (fs.statSync(filePath).isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {

            try {

                const command = require(filePath);

                if (!command?.data?.name || !command?.execute) {
                    throw new Error('Missing data.name or execute');
                }

                client.commands.set(command.data.name, command);

                console.log(`✅ Loaded: ${command.data.name}`);

            } catch (err) {

                errorList.push({
                    file: filePath,
                    message: err.message
                });

                console.log(`❌ Failed: ${file}`);
                console.log(`   └─ ${err.message}`);
            }
        }
    }
}

loadCommands(commandsPath);

/* ===========================
   READY
=========================== */
client.once('ready', async () => {

    console.clear();

    console.log(`
╔════════════════════════════════════╗
║         MOONLIGHT HUB BOT          ║
╠════════════════════════════════════╣
║ 🤖 Bot    : ${client.user.tag}
║ 🌍 Guild  : ${client.guilds.cache.size}
║ 📦 Cmd    : ${client.commands.size}
║ ❌ Error  : ${errorList.length}
║ ✅ Status : Online
╚════════════════════════════════════╝
`);

    /* ===========================
       COMMAND LIST
    =========================== */
    console.log(`📜 COMMAND LIST:`);

    const list = [...client.commands.keys()];

    list.forEach((cmd, i) => {
        console.log(`   ${i + 1}. ${cmd}`);
    });

    console.log(`\n📦 Total Commands Loaded: ${list.length}`);

    /* ===========================
       ERROR REPORT
    =========================== */
    console.log(`\n❌ ERROR REPORT:`);

    if (errorList.length === 0) {
        console.log('   Tidak ada error 🎉');
    } else {

        errorList.forEach((err, i) => {
            console.log(`
${i + 1}. FILE   : ${err.file}
   REASON : ${err.message}
`);
        });
    }

    /* ===========================
       SLASH REGISTER
    =========================== */
    try {

        const commands = [];
        for (const cmd of client.commands.values()) {
            commands.push(cmd.data.toJSON());
        }

        const rest = new REST({ version: '10' })
            .setToken(process.env.TOKEN);

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log(`✅ Slash Commands Registered: ${commands.length}`);

    } catch (err) {
        console.error('❌ Slash Error:', err);
    }

    /* ===========================
       MONGO
    =========================== */
    if (process.env.MONGO_URI) {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ MongoDB Connected');
        } catch (err) {
            console.log('❌ Mongo Error:', err.message);
        }
    }

    /* ===========================
       PRESENCE
    =========================== */
    const updatePresence = () => {

        const guilds = client.guilds.cache.size;

        const members = client.guilds.cache.reduce(
            (a, g) => a + (g.memberCount || 0),
            0
        );

        const uptime = Math.floor(client.uptime / 1000);
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);

        const list = [
            '🌙 Moonlight Hub',
            `🌍 ${guilds} Server`,
            `👥 ${members} Member`,
            `⏱️ ${h}h ${m}m`,
            '🚀 /help'
        ];

        client.user.setPresence({
            activities: [{
                name: list[Math.floor(Math.random() * list.length)],
                type: ActivityType.Watching
            }],
            status: 'dnd'
        });

    };

    updatePresence();
    setInterval(updatePresence, 15000);
});

/* ===========================
   INTERACTION HANDLER
=========================== */
client.on('interactionCreate', async interaction => {

    if (interaction.isChatInputCommand()) {

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.error(err);

            const msg = {
                content: '❌ Error saat menjalankan command',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                interaction.followUp(msg);
            } else {
                interaction.reply(msg);
            }
        }
    }

if (interaction.isButton()) {

      /* ===========================
       VERIFY SYSTEM
       customId: verify_ROLEID
    =========================== */
    if (interaction.customId.startsWith('verify_')) {

        const roleId = interaction.customId.replace('verify_', '');
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
            return interaction.reply({
                content: '❌ Role tidak ditemukan.',
                ephemeral: true
            });
        }

        if (interaction.member.roles.cache.has(roleId)) {
            return interaction.reply({
                content: '✅ Kamu sudah terverifikasi.',
                ephemeral: true
            });
        }

        try {
            await interaction.member.roles.add(roleId);

            return interaction.reply({
                content: `✅ Verifikasi berhasil! Kamu mendapatkan role ${role}.`,
                ephemeral: true
            });
        } catch (err) {
            console.error('Verify Error:', err);

            return interaction.reply({
                content: '❌ Gagal memberikan role. Pastikan role bot berada di atas role tersebut.',
                ephemeral: true
            });
        }
    }

      /* ===========================
       TICKET SYSTEM - CREATE
    =========================== */
    if (interaction.customId === 'ticket_create') {
        if (!Ticket) return;

        try {
            const data = await Ticket.findOne({
                guildId: interaction.guild.id
            });

            if (!data) {
                return interaction.reply({
                    content: '❌ Ticket belum di setup',
                    ephemeral: true
                });
            }

            const existing = interaction.guild.channels.cache.find(
                c => c.name === `ticket-${interaction.user.id}` || c.name === `claimed-${interaction.user.id}`
            );

            if (existing) {
                return interaction.reply({
                    content: '❌ Kamu sudah punya ticket',
                    ephemeral: true
                });
            }

            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.id}`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        id: data.supportRoleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    }
                ]
            });

            const ticketEmbed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setAuthor({
                    name: '🌙 Moonlight Hub • Ticket Support',
                    iconURL: interaction.guild.iconURL({ dynamic: true }) || interaction.client.user.displayAvatarURL()
                })
                .setDescription(
                    `Halo ${interaction.user}! Terima kasih telah menghubungi support.\n` +
                    `Silakan sampaikan pertanyaan atau kendalamu di sini.\n\n` +
                    `**Staff Support** (<@&${data.supportRoleId}>) akan segera membantumu.\n` +
                    `Gunakan tombol di bawah untuk mengelola ticket ini.`
                )
                .setTimestamp()
                .setFooter({
                    text: 'Moonlight Hub • Pelayanan Terbaik 🌙',
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            const ticketRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Claim Ticket')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🙋'),
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📜')
            );

            await channel.send({
                content: `${interaction.user} & <@&${data.supportRoleId}>`,
                embeds: [ticketEmbed],
                components: [ticketRow]
            });

            return interaction.reply({
                content: `✅ Ticket dibuat: ${channel}`,
                ephemeral: true
            });

        } catch (err) {
            console.error('Ticket Create Error:', err);
        }
    }

      /* ===========================
       TICKET SYSTEM - CLAIM
    =========================== */
    if (interaction.customId === 'ticket_claim') {
        if (!Ticket) return;

        try {
            const data = await Ticket.findOne({ guildId: interaction.guild.id });
            if (!data) return;

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

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Claimed')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📜')
            );

            await interaction.reply({ embeds: [claimEmbed] });
            await interaction.message.edit({ components: [row] }).catch(() => null);

        } catch (err) {
            console.error('Ticket Claim Error:', err);
        }
    }

      /* ===========================
       TICKET SYSTEM - CLOSE
    =========================== */
    if (interaction.customId === 'ticket_close') {
        try {
            await interaction.reply({
                content: '🔒 Ticket akan ditutup dalam 5 detik. Mengunduh transcript...'
            });

            let attachment;
            try {
                attachment = await discordTranscripts.createTranscript(interaction.channel, {
                    limit: -1,
                    fileName: `transcript-${interaction.channel.name}.html`,
                    returnType: 'attachment',
                    hydrate: true
                });
            } catch (err) {
                console.error('Failed to create transcript:', err);
            }

            const parts = interaction.channel.name.split('-');
            const creatorId = parts[1];

            if (creatorId) {
                const creator = await interaction.guild.members.fetch(creatorId).catch(() => null);
                if (creator && attachment) {
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#7f5af0')
                        .setTitle('🌙 Moonlight Hub • Ticket Closed')
                        .setDescription(`Ticket-mu di server **${interaction.guild.name}** telah ditutup.\nBerikut adalah salinan riwayat obrolan ticket-mu.`)
                        .setTimestamp()
                        .setFooter({ text: 'Moonlight Hub • Pelayanan Terbaik 🌙' });
                    await creator.send({ embeds: [dmEmbed], files: [attachment] }).catch(() => null);
                }
            }

            if (attachment && interaction.user.id !== creatorId) {
                const modEmbed = new EmbedBuilder()
                    .setColor('#7f5af0')
                    .setTitle('🌙 Moonlight Hub • Ticket Closed')
                    .setDescription(`Kamu telah menutup ticket \`${interaction.channel.name}\` di server **${interaction.guild.name}**.\nBerikut adalah salinan riwayat obrolan ticket tersebut.`)
                    .setTimestamp()
                    .setFooter({ text: 'Moonlight Hub • Pelayanan Terbaik 🌙' });
                await interaction.user.send({ embeds: [modEmbed], files: [attachment] }).catch(() => null);
            }

            setTimeout(async () => {
                await interaction.channel.delete().catch(() => null);
            }, 5000);

        } catch (err) {
            console.error('Ticket Close Error:', err);
        }
    }

      /* ===========================
       TICKET SYSTEM - TRANSCRIPT
    =========================== */
    if (interaction.customId === 'ticket_transcript') {
        try {
            await interaction.deferReply();

            const attachment = await discordTranscripts.createTranscript(interaction.channel, {
                limit: -1,
                fileName: `transcript-${interaction.channel.name}.html`,
                returnType: 'attachment',
                hydrate: true
            });

            const transcriptEmbed = new EmbedBuilder()
                .setColor('#7f5af0')
                .setTitle('📜 Ticket Transcript')
                .setDescription('Transcript berhasil di-generate! Unduh file di bawah untuk melihat riwayat chat.')
                .setTimestamp()
                .setFooter({ text: 'Moonlight Hub • Pelayanan Terbaik 🌙' });

            await interaction.editReply({
                embeds: [transcriptEmbed],
                files: [attachment]
            });

        } catch (err) {
            console.error('Ticket Transcript Error:', err);
            try {
                await interaction.editReply({
                    content: '❌ Gagal membuat transcript.'
                });
            } catch {}
        }
    }
}
});

/* ===========================
   GUILD MEMBER ADD EVENT
=========================== */
client.on('guildMemberAdd', async member => {
    // 1. Welcome System
    if (Welcome) {
        try {
            const data = await Welcome.findOne({ guildId: member.guild.id });
            if (data?.enabled) {
                const channel = member.guild.channels.cache.get(data.channelId);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor('#7f5af0')
                        .setAuthor({
                            name: `🌙 Welcome to ${member.guild.name}!`,
                            iconURL: member.guild.iconURL({ dynamic: true }) || member.user.displayAvatarURL()
                        })
                        .setDescription(`Selamat datang ${member} di **${member.guild.name}**!\nKamu adalah member ke-**${member.guild.memberCount}**.`)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp()
                        .setFooter({ text: 'Moonlight Hub • Selamat Datang! 🌙' });
                    
                    await channel.send({ embeds: [embed] });
                }
            }
        } catch (err) {
            console.error('Welcome Event Error:', err);
        }
    }

    // 2. AutoRole System
    if (AutoRole) {
        try {
            const data = await AutoRole.findOne({ guildId: member.guild.id });
            if (data?.roleId) {
                const role = member.guild.roles.cache.get(data.roleId);
                if (role) {
                    await member.roles.add(role);
                }
            }
        } catch (err) {
            console.error('AutoRole Event Error:', err);
        }
    }
});

/* ===========================
   GUILD MEMBER REMOVE EVENT
=========================== */
client.on('guildMemberRemove', async member => {
    if (Leave) {
        try {
            const data = await Leave.findOne({ guildId: member.guild.id });
            if (data?.enabled) {
                const channel = member.guild.channels.cache.get(data.channelId);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor('#7f5af0')
                        .setAuthor({
                            name: `🌙 Member Keluar`,
                            iconURL: member.guild.iconURL({ dynamic: true }) || member.user.displayAvatarURL()
                        })
                        .setDescription(`**${member.user.tag}** baru saja meninggalkan server.`)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp()
                        .setFooter({ text: 'Moonlight Hub • Sampai Jumpa 👋' });

                    await channel.send({ embeds: [embed] });
                }
            }
        } catch (err) {
            console.error('Leave Event Error:', err);
        }
    }
});

/* ===========================
   MESSAGE REACTION ADD EVENT
=========================== */
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (err) {
            console.error('Fetching reaction failed:', err);
            return;
        }
    }

    if (!ReactionRole) return;

    try {
        const guildId = reaction.message.guildId;
        const messageId = reaction.message.id;
        const emojiName = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;

        const data = await ReactionRole.findOne({ guildId, messageId });
        if (!data) return;

        const matched = data.roles.find(r => r.emoji === emojiName || r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id);
        if (matched) {
            const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
            if (member) {
                await member.roles.add(matched.roleId);
            }
        }
    } catch (err) {
        console.error('Reaction Add Error:', err);
    }
});

/* ===========================
   MESSAGE REACTION REMOVE EVENT
=========================== */
client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (err) {
            console.error('Fetching reaction failed:', err);
            return;
        }
    }

    if (!ReactionRole) return;

    try {
        const guildId = reaction.message.guildId;
        const messageId = reaction.message.id;
        const emojiName = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;

        const data = await ReactionRole.findOne({ guildId, messageId });
        if (!data) return;

        const matched = data.roles.find(r => r.emoji === emojiName || r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id);
        if (matched) {
            const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
            if (member) {
                await member.roles.remove(matched.roleId);
            }
        }
    } catch (err) {
        console.error('Reaction Remove Error:', err);
    }
});

/* ===========================
   GLOBAL ERROR
=========================== */
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

/* ===========================
   LOGIN
=========================== */
client.login(process.env.TOKEN);