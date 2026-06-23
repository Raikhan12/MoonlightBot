const mongoose = require('mongoose');

/* ================= REACTION ROLE SCHEMA ================= */
const reactionRoleSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    messageId: String,

    roles: [
        {
            roleId: String,
            emoji: String
        }
    ]
});

/* ================= FIX MODEL DUPLICATE ================= */
module.exports =
mongoose.models.ReactionRole ||
mongoose.model('ReactionRole', reactionRoleSchema);