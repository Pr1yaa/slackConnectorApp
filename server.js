require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const slackRoutes = require('./routes/slackRoutes');
const cron = require('node-cron');
const ScheduledMessage = require('./models/ScheduledMessage');
const Token = require('./models/Token');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/slack', slackRoutes);

// Scheduler: runs every 30 seconds (adjustable); checks for due messages
cron.schedule('*/30 * * * * *', async () => {
  try {
    const now = new Date();
    const due = await ScheduledMessage.find({ sendAt: { $lte: now }, sent: false });

    for (const msg of due) {
      try {
        // get tokens for team
        const tokenDoc = await Token.findOne({ teamId: msg.teamId });
        if (!tokenDoc) continue;

        // if access token expired, refresh
        if (tokenDoc.expiresAt && new Date() >= tokenDoc.expiresAt) {
          // refresh
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
            console.error('Failed to refresh token', refreshResp.data);
            continue; // skip sending this time
          }
        }

        // send message using chat.postMessage
        const post = await axios.post('https://slack.com/api/chat.postMessage', {
          channel: msg.channel,
          text: msg.text
        }, {
          headers: { Authorization: `Bearer ${tokenDoc.accessToken}` }
        });

        if (post.data && post.data.ok) {
          msg.sent = true;
          msg.sentAt = new Date();
          await msg.save();
          console.log('Sent scheduled message', msg._id);
        } else {
          console.error('Failed to send scheduled message', post.data);
        }
      } catch (err) {
        console.error('Error sending scheduled message', err.message);
      }
    }
  } catch (err) {
    console.error('Scheduler error', err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));