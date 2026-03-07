const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const dotenv = require('dotenv');
const { getOctokit } = require('./github');
const { getProjects } = require('./db');
const { migrateProjects } = require('./migrate');
const { writeCsv } = require('./csvWriter');

async function main() {
  const argv = minimist(process.argv.slice(2));

  dotenv.config();

  const startId = parseInt(argv['start-id'], 10);
  const endId = parseInt(argv['end-id'], 10);
  const privateKeyPath = process.env.PRIVATE_KEY_PATH || 'src/config/private-key.pem';
  const org = process.env.ORG_NAME;

  console.log(`Migration start: ids ${startId}..${endId}`);

  const appId = process.env.GITHUB_APP_ID;
  const installationId = process.env.GITHUB_INSTALLATION_ID;

  if (!appId || !installationId) {
    console.error('GITHUB_APP_ID and GITHUB_INSTALLATION_ID must be set in environment');
    process.exit(2);
  }

  const octokit = await getOctokit({ appId, installationId, privateKeyPath });

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    table: process.env.DB_TABLE
  };

  const projects = await getProjects({ startId, endId, dbConfig });
  console.log(`Found ${projects.length} projects to migrate`);

  const mapping = await migrateProjects({ octokit, org, projects });

  const outDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'mapping.csv');
  writeCsv(mapping, outPath);

  console.log(`Migration complete. Mapping written to ${outPath}`);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
