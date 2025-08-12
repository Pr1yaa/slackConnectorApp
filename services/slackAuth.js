const axios = require('axios');
const Installation = require('../models/installation');
const { encrypt, decrypt } = require('../lib/crypto');

async function refreshAccessToken(teamId){
  const installation = await Installation.findOne({ team_id: teamId });
  if (!installation || !installation.refresh_token) throw new Error('No refresh token for team ' + teamId);
  const refresh_token = decrypt(installation.refresh_token);

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token
  }).toString();

  const resp = await axios.post('https://slack.com/api/oauth.v2.access', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    auth: { username: process.env.SLACK_CLIENT_ID, password: process.env.SLACK_CLIENT_SECRET }
  });

  if (!resp.data || resp.data.ok === false) throw new Error(resp.data?.error || 'Slack refresh failed');

  // update tokens (encrypt before saving)
  installation.access_token = encrypt(resp.data.access_token);
  if (resp.data.refresh_token) installation.refresh_token = encrypt(resp.data.refresh_token);
  if (resp.data.expires_in) installation.token_expires_at = new Date(Date.now() + resp.data.expires_in*1000);
  installation.updated_at = new Date();
  await installation.save();
  return installation;
}

async function saveInstallationFromOAuthResponse(oauthData){
  // oauthData is the full resp.data from oauth.v2.access
  const teamId = oauthData.team?.id || oauthData.team_id;
  const doc = {
    team_id: teamId,
    app_id: oauthData.app_id || oauthData.team?.app_id,
    bot_user_id: oauthData.bot_user_id || (oauthData.authed_user && oauthData.authed_user.id),
    scopes: (oauthData.scope || '').split(/[\s,]+/).filter(Boolean),
    updated_at: new Date()
  };
  if (oauthData.access_token) doc.access_token = encrypt(oauthData.access_token);
  if (oauthData.refresh_token) doc.refresh_token = encrypt(oauthData.refresh_token);
  if (oauthData.expires_in) doc.token_expires_at = new Date(Date.now() + oauthData.expires_in*1000);
  await Installation.findOneAndUpdate({ team_id: teamId }, doc, { upsert: true, new: true });
}

module.exports = { refreshAccessToken, saveInstallationFromOAuthResponse };
