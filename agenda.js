const Agenda = require('agenda');
const ScheduledMessage = require('./models/scheduledMessage');
const Installation = require('./models/installation');
const { decrypt } = require('./lib/crypto');
const slackApi = require('./services/slackApi');
const slackAuth = require('./services/slackAuth');

const agenda = new Agenda({ db: { address: process.env.MONGO_URI, collection: 'agendaJobs' } });

agenda.define('sendScheduledMessage', async job => {
  const { scheduledId } = job.attrs.data || {};
  if (!scheduledId) return;
  const scheduled = await ScheduledMessage.findById(scheduledId);
  if (!scheduled || scheduled.status !== 'scheduled') return;
  try {
    const inst = await Installation.findOne({ team_id: scheduled.team_id });
    if (!inst) { scheduled.status = 'failed'; scheduled.result = 'No installation'; await scheduled.save(); return; }
    // ensure token valid (try refresh if needed)
    const expiresAt = inst.token_expires_at ? new Date(inst.token_expires_at).getTime() : 0;
    if (!expiresAt || (expiresAt - Date.now() < 5*60*1000)) {
      try { await slackAuth.refreshAccessToken(inst.team_id); }
      catch(err){ scheduled.status='failed'; scheduled.result = {error: 'refresh failed', detail: err.message}; await scheduled.save(); return; }
    }
    const token = decrypt(inst.access_token);
    await slackApi.postMessage(token, { channel: scheduled.channel, text: scheduled.text, thread_ts: scheduled.thread_ts });
    scheduled.status = 'sent';
    scheduled.result = { sent_at: new Date() };
    await scheduled.save();
  } catch (err) {
    console.error('Agenda sendScheduledMessage error', err);
    scheduled.status = 'failed';
    scheduled.result = { error: err.message };
    await scheduled.save();
  }
});

(async function() { await agenda.start(); })();

module.exports = agenda;
