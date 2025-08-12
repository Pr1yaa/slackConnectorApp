const axios = require('axios');
const Token = require('../models/Token');
const ScheduledMessage = require('../models/ScheduledMessage');

exports.install = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    scope: 'chat:write,channels:read',
    redirect_uri: process.env.SLACK_REDIRECT_URI
  });

  res.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
};

exports.oauthCallback = async (req, res) => {
  const code = req.query.code;
  try {
    const resp = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI
      }
    });

    const data = resp.data;
    if (!data.ok) {
      console.error('OAuth error', data);
      return res.status(400).send('OAuth failed');
    }

    // Save tokens
    const teamId = data.team.id;
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token; // may be undefined depending on app config
    const expiresIn = data.expires_in; // seconds

    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

    await Token.findOneAndUpdate({ teamId }, {
      teamId,
      accessToken,
      refreshToken,
      expiresAt,
      teamName: data.team.name
    }, { upsert: true });

    // redirect back to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:4200');
  } catch (err) {
    console.error('oauthCallback error', err.message);
    res.status(500).send('OAuth error');
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { teamId, channel, text } = req.body;
    // find token (if teamId not provided, pick the only token for simplicity)
    const tokenDoc = teamId ? await Token.findOne({ teamId }) : await Token.findOne();
    if (!tokenDoc) return res.status(400).json({ error: 'No token connected' });

    // refresh if expired
    if (tokenDoc.expiresAt && new Date() >= tokenDoc.expiresAt) {
      // refresh logic
      const refreshResp = await axios.post('https://slack.com/api/oauth.v2.access', null, {
        params: {
          grant_type: 'refresh_token',
          client_id: process.env.SLACK_CLIENT_ID,
          client_secret: process.env.SLACK_CLIENT_SECRET,
          refresh_token: tokenDoc.refreshToken
        }
      });

      if (refreshResp.data.ok) {
        tokenDoc.accessToken = refreshResp.data.access_token;
        if (refreshResp.data.refresh_token) tokenDoc.refreshToken = refreshResp.data.refresh_token;
        if (refreshResp.data.expires_in) tokenDoc.expiresAt = new Date(Date.now() + refreshResp.data.expires_in * 1000);
        await tokenDoc.save();
      } else {
        console.error('refresh failed', refreshResp.data);
        return res.status(500).json({ error: 'Token refresh failed' });
      }
    }

    const postResp = await axios.post('https://slack.com/api/chat.postMessage', {
      channel,
      text
    }, {
      headers: { Authorization: `Bearer ${tokenDoc.accessToken}` }
    });

    return res.json(postResp.data);
  } catch (err) {
    console.error('sendMessage error', err.message);
    res.status(500).json({ error: 'Send failed' });
  }
};

exports.scheduleMessage = async (req, res) => {
  try {
    const { teamId, channel, text, sendAt } = req.body;
    const sendDate = new Date(sendAt);
    if (isNaN(sendDate)) return res.status(400).json({ error: 'Invalid date' });

    const msg = new ScheduledMessage({ teamId, channel, text, sendAt: sendDate });
    await msg.save();
    res.json({ ok: true, id: msg._id });
  } catch (err) {
    console.error('scheduleMessage error', err.message);
    res.status(500).json({ error: 'Schedule failed' });
  }
};

exports.listScheduled = async (req, res) => {
  try {
    const list = await ScheduledMessage.find({}).sort({ sendAt: 1 });
    res.json(list);
  } catch (err) {
    console.error('listScheduled error', err.message);
    res.status(500).json({ error: 'List failed' });
  }
};

exports.cancelScheduled 