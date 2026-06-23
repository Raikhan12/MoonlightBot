const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    supportRoleId: String
});

module.exports =
    mongoose.models.Ticket ||
    mongoose.model('Ticket', ticketSchema);