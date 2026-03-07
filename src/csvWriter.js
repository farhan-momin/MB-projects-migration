const fs = require('fs');

function writeCsv(mapping, outPath) {
  const lines = ['old_id,new_repo_name,repo_url'];
  for (const m of mapping) {
    lines.push(`${m.old_id},${m.new_repo_name},${m.repo_url}`);
  }
  fs.writeFileSync(outPath, lines.join('\n'));
}

module.exports = { writeCsv };
