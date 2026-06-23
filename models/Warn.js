const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
    guildId: String,
    userId: String,
    moderatorId: String,
    reason: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/* ===========================
   FIX DUPLICATE MODEL ERROR
=========================== */
module.exports =
    mongoose.models.Warn ||
    mongoose.model('Warn', warnSchema);