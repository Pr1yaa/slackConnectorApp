const express = require('express');
const ScheduledMessage = require('../models/scheduledMessage');
const agenda = require('../agenda');
const router = express.Router();

// List scheduled messages by installation id (query param)
router.get('/scheduled', async (req, res) => {
  const { installationId } = req.query;
  const list = await ScheduledMessage.find({ installation_id: installationId }).sort({ scheduled_for: 1 });
  res.json({ ok:true, list });
});

// Cancel scheduled message
router.post('/cancel/:id', async (req, res) => {
  const id = req.params.id;
  const msg = await ScheduledMessage.findById(id);
  if (!msg) return res.status(404).json({ ok:false, error: 'not found' });
  if (msg.status !== 'scheduled') return res.status(400).json({ ok:false, error: 'cannot cancel' });

  // remove job from agenda using job data filter
  await agenda.cancel({ 'data.scheduledMessageId': id.toString() });
  msg.status = 'cancelled';
  await msg.save();
  res.json({ ok:true });
});

module.exports = router;
