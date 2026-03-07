const fs = require('fs');
const { Octokit } = require('octokit');
const { createAppAuth } = require('@octokit/auth-app');
const { throttling } = require('@octokit/plugin-throttling');

const MyOctokit = Octokit.plugin(throttling);

let octokitClient = null;

async function getOctokit({ appId, installationId, privateKeyPath }) {
  if (octokitClient) return octokitClient;

  if (!appId || !installationId || !privateKeyPath) {
    throw new Error('appId, installationId and privateKeyPath are required');
  }

  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

  octokitClient = new MyOctokit({
    authStrategy: createAppAuth,
    auth: {
      appId: Number(appId),
      installationId: Number(installationId),
      privateKey
    },
    throttle: {
      onRateLimit: (retryAfter, options, octokit, retryCount) => {
        console.warn(
          `Rate limit hit for ${options.method} ${options.url}`
        );

        if (retryCount < 2) {
          console.log(`Retrying after ${retryAfter} seconds`);
          return true; // retry
        }
      },
      onSecondaryRateLimit: (retryAfter, options, octokit) => {
        console.warn(
          `Secondary rate limit detected for ${options.method} ${options.url}`
        );
      }
    }
  });

  return octokitClient;
}

module.exports = { getOctokit };
