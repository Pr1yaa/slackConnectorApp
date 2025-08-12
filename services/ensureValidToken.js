const Installation = require('../models/installation');
const slackAuth = require('./slackAuth');
const { decrypt } = require('../lib/crypto');

module.exports = async function ensureValidToken(req, res, next){
  try {
    const teamId = req.body.team_id || req.query.team_id || req.headers['x-team-id'] || (req.installation && req.installation.team_id);
    if (!teamId) return res.status(400).json({ error: 'Missing team id' });
    let inst = await Installation.findOne({ team_id: teamId });
    if (!inst) return res.status(404).json({ error: 'Installation not found' });

    const expiresAt = inst.token_expires_at ? new Date(inst.token_expires_at).getTime() : 0;
    // refresh if expiring in next 5 minutes or already expired
    if (!expiresAt || (expiresAt - Date.now() < 5*60*1000)) {
      try {
        inst = await slackAuth.refreshAccessToken(teamId);
      } catch (err) {
        console.error('Failed to refresh token for', teamId, err.message);
        return res.status(500).json({ error: 'Failed to refresh token' });
      }
    }
    req.installation = inst;
    req.access_token = decrypt(inst.access_token);
    next();
  } catch (err) {
    console.error('ensureValidToken error', err);
    res.status(500).json({ error: 'Server error' });
  }
};
