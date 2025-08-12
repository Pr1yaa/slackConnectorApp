const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InstallationSchema = new Schema({
  team_id: { type: String, index: true, unique: true, required: true },
  app_id: String,
  bot_user_id: String,
  access_token: String,    // encrypted
  refresh_token: String,   // encrypted
  scopes: [String],
  token_expires_at: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

module.exports = mongoose.model('Installation', InstallationSchema);
