const fs = require('fs');
const { execSync } = require('child_process');

// Read current version
const versionPath = './version.json';
const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));

// Get current git commit hash
try {
  const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  versionData.lastCommit = commitHash;
} catch (error) {
  console.log('Not a git repository or no commits yet');
  versionData.lastCommit = 'unknown';
}

// Get current timestamp
versionData.lastDeploy = new Date().toISOString();

// Write updated version
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));

console.log(`Version updated: ${versionData.version} (build ${versionData.build})`);
console.log(`Last commit: ${versionData.lastCommit}`);
console.log(`Last deploy: ${versionData.lastDeploy}`);
