require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandNames = [];

let totalLoaded = 0;
let totalError = 0;

/* ===========================
   LOAD COMMANDS
=========================== */
function loadCommands(dir) {

    const files = fs.readdirSync(dir);

    for (const file of files) {

        const filePath = path.join(dir, file);

        if (fs.statSync(filePath).isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {

            try {

                console.log(`📦 Checking: ${filePath}`);

                const command = require(filePath);

                if (!command?.data?.toJSON) {
                    console.log(`⚠️ Invalid structure: ${filePath}`);
                    totalError++;
                    continue;
                }

                const json = command.data.toJSON();

                if (!json.name || !json.description) {
                    console.log(`❌ Missing name/description: ${filePath}`);
                    totalError++;
                    continue;
                }

                commands.push(json);
                commandNames.push(json.name);

                totalLoaded++;

                console.log(`✅ Loaded: ${json.name}`);

            } catch (err) {
                totalError++;
                console.log(`💥 Error: ${filePath}`);
                console.log(err.message);
            }
        }
    }
}

loadCommands(path.join(__dirname, 'commands'));

/* ===========================
   DEPLOY
=========================== */
(async () => {

    try {

        console.log(`
╔════════════════════════════════════╗
║         COMMAND DEPLOYER           ║
╠════════════════════════════════════╣
║ 📦 Loaded : ${totalLoaded}
║ ❌ Error  : ${totalError}
╚════════════════════════════════════╝
`);

        /* ===========================
           COMMAND LIST (A - Z FIX)
        =========================== */
        console.log(`📜 COMMAND LIST:`);

        commandNames
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
            .forEach((cmd, i) => {
                console.log(`   ${i + 1}. ${cmd}`);
            });

        console.log(`\n🚀 Deploying commands...`);

        /* ===========================
           REST DEPLOY
        =========================== */
        const rest = new REST({ version: '10' })
            .setToken(process.env.TOKEN);

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log(`
╔════════════════════════════════════╗
║        DEPLOY SUCCESS              ║
╠════════════════════════════════════╣
║ 📦 Commands : ${totalLoaded}
║ ❌ Errors   : ${totalError}
║ 📡 Status   : Online
╚════════════════════════════════════╝
`);

    } catch (err) {
        console.error('❌ Deploy Failed:', err);
    }
})();