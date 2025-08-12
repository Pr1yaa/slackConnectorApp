const axios = require('axios');

async function postMessage(accessToken, { channel, text, thread_ts }){
  const res = await axios.post('https://slack.com/api/chat.postMessage',
    { channel, text, thread_ts },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type':'application/json' } }
  );
  if (!res.data || res.data.ok === false) throw new Error(res.data?.error || 'Slack postMessage failed');
  return res.data;
}

async function listChannels(accessToken, cursor){
  const res = await axios.get('https://slack.com/api/conversations.list', {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { types: 'public_channel,private_channel', limit: 200, cursor }
  });
  if (!res.data || res.data.ok === false) throw new Error(res.data?.error || 'Slack list channels failed');
  return res.data;
}

module.exports = { postMessage, listChannels };
