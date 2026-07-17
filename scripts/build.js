const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
fs.rmSync(path.join(projectRoot, 'public'), { recursive: true, force: true });

const result = spawnSync('hugo', ['--minify'], { cwd: projectRoot, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
