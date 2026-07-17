const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const requiredFiles = [
  'hugo.toml',
  'content/_index.md',
  'content/posts/_index.md',
  'content/about.md',
  'content/archives/_index.md',
  'archetypes/posts.md',
  'layouts/_default/baseof.html',
  'layouts/_default/list.html',
  'layouts/_default/single.html',
  'layouts/index.html',
  'layouts/archives/list.html',
  'layouts/partials/head.html',
  'layouts/partials/header.html',
  'layouts/partials/footer.html',
  'layouts/partials/post-card.html',
  'assets/css/main.css',
  'assets/js/theme.js',
  'scripts/build.js',
  '.github/workflows/hugo.yaml',
];

for (const file of requiredFiles) {
  assert.ok(fs.existsSync(file), `缺少 Hugo 文件：${file}`);
}

const config = fs.readFileSync('hugo.toml', 'utf8');
assert.match(config, /^title\s*=\s*["']思绪花园["']/m);
assert.match(config, /^locale\s*=\s*["']zh-CN["']/m);
assert.match(config, /^enableRobotsTXT\s*=\s*true/m);
assert.match(config, /posts\s*=\s*["']\/:year\/:month\/:slug\/["']/);
assert.doesNotMatch(config, /localhost|127\.0\.0\.1|file:\/\//i);

const base = fs.readFileSync('layouts/_default/baseof.html', 'utf8');
assert.match(base, /<!doctype html>/i);
assert.match(base, /<html[^>]+lang=/i);
assert.match(base, /block\s+["']main["']/);
assert.match(base, /partial\s+["']head\.html["']/);

const contentDirectory = 'content/posts';
const posts = [];
function collectPosts(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) collectPosts(file);
    else if (entry.name.endsWith('.md') && entry.name !== '_index.md') posts.push(file);
  }
}
collectPosts(contentDirectory);
for (const file of posts) {
  const source = fs.readFileSync(file, 'utf8');
  assert.match(source, /^---[\s\S]*?^---/m, `${file} 缺少 front matter`);
  assert.match(source, /^title:\s*.+$/m, `${file} 缺少 title`);
  assert.match(source, /^date:\s*\d{4}-\d{2}-\d{2}/m, `${file} 缺少有效 date`);
  assert.match(source, /^description:\s*.+$/m, `${file} 缺少 description`);
  assert.match(source, /^tags:\s*\[/m, `${file} 缺少 tags`);
  assert.match(source, /^draft:\s*(?:true|false)$/m, `${file} 缺少 draft 状态`);
}

const workflow = fs.readFileSync('.github/workflows/hugo.yaml', 'utf8');
assert.match(workflow, /actions\/configure-pages@[a-f0-9]{40}/);
assert.match(workflow, /actions\/upload-pages-artifact@[a-f0-9]{40}/);
assert.match(workflow, /actions\/deploy-pages@[a-f0-9]{40}/);
assert.match(workflow, /sha256sum --check/);
assert.match(workflow, /npm ci && npm test/);
assert.match(workflow, /pages:\s*write/);
assert.match(workflow, /id-token:\s*write/);

console.log('✓ Hugo 源码结构测试全部通过');
