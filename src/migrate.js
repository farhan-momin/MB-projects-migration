const { v4: uuidv4 } = require('uuid');
const { createMeta } = require('./hash');

async function createRepoForOrg(octokit, org, name, description = '') {
  try {
    const resp = await octokit.rest.repos.createInOrg({ org, name, description, private: false });
    return resp.data;
  } catch (err) {
    if (err.status === 422 && err.message && err.message.includes('name already exists')) {
      const newName = `${name}-${uuidv4()}`;
      const resp = await octokit.rest.repos.createInOrg({ org, name: newName, description, private: false });
      return resp.data;
    }
    throw err;
  }
}

async function writeFile(octokit, owner, repo, path, contentJson, message) {
  const content = Buffer.from(JSON.stringify(contentJson)).toString('base64');
  return octokit.rest.repos.createOrUpdateFileContents({ owner, repo, path, message, content });
}

async function migrateProjects({ octokit, org, projects }) {
  const mapping = [];
  for (const p of projects) {
    const baseName = (p.name && p.name.replace(/ /g, '_')) || (`project-${p.id}`);
    let repoName = baseName;
    let repoData = null;

    

    try {
      repoData = await createRepoForOrg(octokit, org, repoName, `Migrated project`);
      repoName = repoData.name;
      const owner = repoData.owner.login;

      await writeFile(octokit, owner, repoName, 'projectData.json', JSON.stringify(p.projectData), 'Add projectData.json');

      const meta = createMeta(p.theme || '');
      await writeFile(octokit, owner, repoName, 'metaData.json', meta, 'Add metaData.json');

      mapping.push({ old_id: p.id, new_repo_name: repoName, repo_url: repoData.html_url });
      console.log(`Created repo ${repoData.full_name}`);
    } catch (err) {
      console.error(`Failed to migrate project ${p.id}:`, err.message || err);
    }
  }
  return mapping;
}

module.exports = { migrateProjects };
