const mongoose = require('mongoose');

module.exports = mongoose.model(
    'leave',
    new mongoose.Schema({
        guildId: String,
        channelId: String,
        enabled: {
            type: Boolean,
            default: true
        }
    })
);