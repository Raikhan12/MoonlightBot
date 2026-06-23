const mongoose = require('mongoose');

module.exports = mongoose.model(
    'autoroles',
    new mongoose.Schema({
        guildId: String,
        roleId: String
    })
);