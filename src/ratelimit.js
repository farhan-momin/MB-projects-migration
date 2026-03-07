// Simple script to fetch GitHub rate limit using the project's getOctokit helper.
// Required env vars: GITHUB_APP_ID, GITHUB_INSTALLATION_ID, PRIVATE_KEY_PATH

require('dotenv').config();
const { getOctokit } = require('./github');

async function getRateLimit(octokit) {
  const resp = await octokit.request('GET /rate_limit');
  return resp;
}

async function main() {
  const { GITHUB_APP_ID, GITHUB_INSTALLATION_ID, PRIVATE_KEY_PATH } = process.env;
  if (!GITHUB_APP_ID || !GITHUB_INSTALLATION_ID || !PRIVATE_KEY_PATH) {
    console.error('Missing required env vars. Set GITHUB_APP_ID, GITHUB_INSTALLATION_ID, PRIVATE_KEY_PATH');
    process.exit(1);
  }

  try {
    const octokit = await getOctokit({
      appId: GITHUB_APP_ID,
      installationId: GITHUB_INSTALLATION_ID,
      privateKeyPath: PRIVATE_KEY_PATH,
    });

    const resp = await getRateLimit(octokit);
    console.log(JSON.stringify(resp.data, null, 2));
    console.log('Rate headers:', {
      limit: resp.headers['x-ratelimit-limit'],
      remaining: resp.headers['x-ratelimit-remaining'],
      used: resp.headers['x-ratelimit-used'],
      reset: resp.headers['x-ratelimit-reset'],
      resource: resp.headers['x-ratelimit-resource']
    });
  } catch (err) {
    console.error('Failed to fetch rate limit:', err && err.message ? err.message : err);
    if (err && err.status) console.error('HTTP status:', err.status);
    process.exit(1);
  }
}

module.exports = { getRateLimit };

if (require.main === module) main();
