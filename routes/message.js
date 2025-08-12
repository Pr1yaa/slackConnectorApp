const express = require('express');
const router = express.Router();
const ensureValidToken = require('../services/ensureValidToken');
const slackApi = require('../services/slackApi');
const ScheduledMessage = require('../models/scheduledMessage');
const agenda = require('../agenda');

// immediate send
router.post('/messages/send', ensureValidToken, async (req, res) => {
  try {
    const { channel, text, thread_ts } = req.body;
    if (!channel || !text) return res.status(400).json({ error: 'channel and text required' });
    const data = await slackApi.postMessage(req.access_token, { channel, text, thread_ts });
    res.json({ ok: true, result: data });
  } catch (err) {
    console.error('send error', err.message);
    res.status(500).json({ error: err.message });
  }
});

// schedule a message
router.post('/messages/schedule', ensureValidToken, async (req, res) => {
  try {
    const { channel, text, send_at, thread_ts } = req.body;
    if (!channel || !text || !send_at) return res.status(400).json({ error: 'channel, text and send_at required' });
    const sendDate = new Date(send_at);
    if (isNaN(sendDate)) return res.status(400).json({ error: 'invalid send_at' });
    const scheduled = await ScheduledMessage.create({
      team_id: req.installation.team_id,
      channel, text, thread_ts,
      send_at: sendDate
    });
    const job = await agenda.schedule(scheduled.send_at, 'sendScheduledMessage', { scheduledId: scheduled._id.toString() });
    scheduled.agenda_job_id = job.attrs._id;
    await scheduled.save();
    res.json({ ok: true, scheduled });
  } catch (err) {
    console.error('schedule error', err);
    res.status(500).json({ error: err.message });
  }
});

// list scheduled messages (for a team)
router.get('/messages/scheduled', ensureValidToken, async (req, res) => {
  try {
    const teamId = req.installation.team_id;
    const scheduled = await ScheduledMessage.find({ team_id: teamId, status: 'scheduled' }).sort({ send_at: 1 }).limit(200);
    res.json({ ok: true, scheduled });
  } catch (err) {
    console.error('list scheduled error', err);
    res.status(500).json({ error: err.message });
  }
});

// cancel scheduled message
router.delete('/messages/:id', ensureValidToken, async (req, res) => {
  try {
    const id = req.params.id;
    const scheduled = await ScheduledMessage.findById(id);
    if (!scheduled) return res.status(404).json({ error: 'not found' });
    if (scheduled.team_id !== req.installation.team_id) return res.status(403).json({ error: 'not authorized' });
    // cancel job in agenda if id stored
    if (scheduled.agenda_job_id) {
      try { await agenda.cancel({ _id: scheduled.agenda_job_id }); }
      catch(e){ console.warn('agenda cancel warning', e.message); }
    }
    scheduled.status = 'canceled';
    await scheduled.save();
    res.json({ ok: true, scheduled });
  } catch (err) {
    console.error('cancel scheduled error', err);
    res.status(500).json({ error: err.message });
  }
});

// list channels for UI
router.get('/channels', ensureValidToken, async (req, res) => {
  try {
    const cursor = req.query.cursor;
    const data = await slackApi.listChannels(req.access_token, cursor);
    res.json({ ok: true, channels: data.channels, next_cursor: data.response_metadata?.next_cursor });
  } catch (err) {
    console.error('channels error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
