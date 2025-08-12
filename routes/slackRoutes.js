const express = require('express');
const router = express.Router();
const slackController = require('../controllers/slackController');

router.get('/install', slackController.install); // redirect to Slack OAuth
router.get('/oauth/callback', slackController.oauthCallback); // OAuth redirect

router.post('/send', slackController.sendMessage);
router.post('/schedule', slackController.scheduleMessage);
router.get('/scheduled', slackController.listScheduled);
router.delete('/scheduled/:id', slackController.cancelScheduled);

module.exports = router;