const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  teamId: { type: String, index: true },
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,
  teamName: String
}, { timestamps: true });

module.exports = mongoose.model('Token', TokenSchema);