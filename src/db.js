const mysql = require('mysql2/promise');

function parseProjectData(raw) {
  const decoded = Buffer.from(raw, 'base64').toString('utf8');
  return JSON.parse(decodeURIComponent(decoded));

}

async function getProjects({ startId, endId, dbConfig }) {
  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    throw new Error('DB_HOST, DB_USER, DB_NAME must be set in environment or passed in dbConfig');
  }
  const table = dbConfig.table || 'Projects';
  const conn = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
  });

  const limit = BigInt(endId - startId)
  const offset = BigInt(startId)
  const sql = `SELECT ProjectID, ProjectName, ProjectData FROM ${table} ORDER BY ProjectCreatedDate DESC LIMIT ? OFFSET ?;`
  const [rows] = await conn.execute(sql, [limit, offset]);
  await conn.end();

  rows.map(r => console.log(typeof r.ProjectData))
  return rows.map(r => ({
    id: r.ProjectID,
    name: r.ProjectName,
    projectData: parseProjectData(r.ProjectData),
    theme: 'default'
  }));
}

module.exports = { getProjects };
