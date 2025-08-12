const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScheduledSchema = new Schema({
  team_id: { type: String, required: true, index: true },
  channel: { type: String, required: true },
  text: { type: String, required: true },
  thread_ts: String,
  send_at: { type: Date, required: true, index: true },
  status: { type: String, enum: ['scheduled','sent','canceled','failed'], default: 'scheduled' },
  agenda_job_id: Schema.Types.Mixed,
  created_by: String,
  created_at: { type: Date, default: Date.now },
  result: Schema.Types.Mixed
});

module.exports = mongoose.model('ScheduledMessage', ScheduledSchema);
