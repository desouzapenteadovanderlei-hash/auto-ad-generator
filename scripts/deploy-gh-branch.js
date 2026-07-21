const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

async function main() {
  const root = process.cwd();
  const publicDir = path.join(root, '.output', 'public');
  if (!fs.existsSync(publicDir)) {
    console.error('.output/public not found — run the build first');
    process.exit(1);
  }

  const tmp = path.join(root, '.gh-pages-temp');
  if (fs.existsSync(tmp)) await fs.remove(tmp);
  await fs.mkdirp(tmp);

  console.log('Copying build to temporary directory...');
  await fs.copy(publicDir, tmp);

  const repoUrl = execSync('git config --get remote.origin.url').toString().trim();
  if (!repoUrl) {
    console.error('Could not read remote.origin.url from git config');
    process.exit(1);
  }

  try {
    run('git init', { cwd: tmp });
    run('git checkout --orphan gh-pages', { cwd: tmp });
    run('git add --all', { cwd: tmp });
    const msg = `deploy: ${new Date().toISOString()}`;
    run(`git -c user.name=\"auto-deploy\" -c user.email=\"actions@local\" commit -m "${msg}"`, { cwd: tmp });
    run(`git push --force ${repoUrl} gh-pages`, { cwd: tmp });
    console.log('Deployed to gh-pages branch. Cleaning up...');
  } catch (err) {
    console.error('Deploy failed:', err);
    process.exit(1);
  } finally {
    // keep the temp folder for inspection in case of failure; remove on success
    try { await fs.remove(tmp); } catch (_) {}
  }
}

main();
