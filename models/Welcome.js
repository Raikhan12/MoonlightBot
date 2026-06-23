const mongoose = require('mongoose');

module.exports = mongoose.model(
    'welcome',
    new mongoose.Schema({
        guildId: String,
        channelId: String,
        enabled: {
            type: Boolean,
            default: true
        }
    })
);