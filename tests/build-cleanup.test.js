const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

const sentinel = path.resolve('public/stale-sentinel.html');
fs.mkdirSync(path.dirname(sentinel), { recursive: true });
fs.writeFileSync(sentinel, 'stale');

const result = spawnSync(process.execPath, ['scripts/build.js'], { stdio: 'inherit' });
assert.equal(result.status, 0, 'Hugo 构建失败');
assert.ok(!fs.existsSync(sentinel), '构建前应清理旧的 public 文件');

console.log('✓ Hugo 清洁构建测试通过');
