const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const { saveInstallationFromOAuthResponse } = require('../services/slackAuth');
const router = express.Router();
const crypto = require('crypto');

function generateState(){ return crypto.randomBytes(16).toString('hex'); }

// /auth/install -> redirect user to Slack authorize URL
router.get('/auth/install', (req, res)=>{
  const state = generateState();
  req.session.oauth_state = state;
  const scopes = ['chat:write','channels:read','groups:read','im:read','mpim:read'].join(' ');
  const redirect = `${process.env.BASE_URL}/auth/callback`;
  const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirect)}&state=${state}`;
  res.redirect(url);
});

// /auth/callback -> handle Slack response and exchange code for tokens
router.get('/auth/callback', async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return res.status(400).send('Slack authorization error: ' + error);
  if (!state || state !== req.session.oauth_state) return res.status(403).send('Invalid state; possible CSRF.');
  delete req.session.oauth_state;
  if (!code) return res.status(400).send('Missing code');
  try {
    const redirect = `${process.env.BASE_URL}/auth/callback`;
    const params = qs.stringify({ code, redirect_uri: redirect });
    const resp = await axios.post('https://slack.com/api/oauth.v2.access', params, {
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      auth: { username: process.env.SLACK_CLIENT_ID, password: process.env.SLACK_CLIENT_SECRET }
    });
    if (!resp.data || resp.data.ok === false) {
      console.error('Slack oauth error', resp.data);
      return res.status(500).send('Install failed: ' + (resp.data?.error || 'unknown'));
    }
    // save installation securely
    await saveInstallationFromOAuthResponse(resp.data);
    // redirect back to frontend UI (if frontend URL provided)
    const frontend = process.env.FRONTEND_URL || '/';
    res.redirect(frontend + '?installed=1');
  } catch (err) {
    console.error('oauth callback error', err.response?.data || err.message);
    res.status(500).send('Install failed. Check logs.');
  }
});

module.exports = router;
