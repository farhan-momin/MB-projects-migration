const crypto = require('crypto');

function hashPlain(plain) {
  return crypto.createHash('sha256').update(plain, 'utf8').digest('hex');
}

function createMeta(theme = '') {
  const createdAt = new Date().toISOString();
  const oneTimeKey = crypto.randomBytes(24).toString('hex');
  const hashedKey = hashPlain(oneTimeKey);
  return { createdAt, theme, hashedKey };
}

module.exports = { hashPlain, createMeta };
