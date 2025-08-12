const crypto = require('crypto');
const keyHex = process.env.TOKEN_ENCRYPTION_KEY;
if (!keyHex) {
  console.warn('TOKEN_ENCRYPTION_KEY not set — encryption will fail at runtime.');
}
const key = keyHex ? Buffer.from(keyHex, 'hex') : null; // expect 32-byte hex

function encrypt(text){
  if (!key) throw new Error('Encryption key missing');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(text,'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(b64){
  if (!key) throw new Error('Encryption key missing');
  const data = Buffer.from(b64, 'base64');
  const iv = data.slice(0,12);
  const tag = data.slice(12,28);
  const enc = data.slice(28);
  const decipher = require('crypto').createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

module.exports = { encrypt, decrypt };
