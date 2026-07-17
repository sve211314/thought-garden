const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const requiredOutput = [
  'public/index.html',
  'public/posts/index.html',
  'public/tags/index.html',
  'public/archives/index.html',
  'public/about/index.html',
  'public/index.xml',
  'public/404.html',
];
for (const file of requiredOutput) assert.ok(fs.existsSync(file), `缺少构建产物：${file}`);

const htmlFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) htmlFiles.push(file);
  }
}
walk('public');

assert.ok(htmlFiles.length >= 7, '应生成博客基础页面');
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /<!doctype html>/i, `${file} 缺少 doctype`);
  assert.match(html, /<html[^>]+lang=(?:["']zh-CN["']|zh-CN(?:\s|>))/i, `${file} 缺少中文 lang`);
  if (/http-equiv=(?:["']refresh["']|refresh)/i.test(html)) continue;
  assert.match(html, /<meta[^>]+charset=/i, `${file} 缺少 charset`);
  assert.match(html, /<meta[^>]+name=(?:["']viewport["']|viewport(?:\s|>))/i, `${file} 缺少 viewport`);
  assert.match(html, /<main\b/i, `${file} 缺少 main`);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${file} 必须恰好有一个 h1`);
  assert.doesNotMatch(html, /\{\{[%<]?/, `${file} 泄漏 Hugo 模板表达式`);
  assert.doesNotMatch(html, /(?:src|href)=["'](?:file:|\/Users\/|[A-Za-z]:\\)/i);
  assert.doesNotMatch(html, /localhost|127\.0\.0\.1/i);
  assert.doesNotMatch(html, /href=["']#["']/i);
}

const home = fs.readFileSync('public/index.html', 'utf8');
assert.match(home, /思绪花园/);
assert.match(home, /data-theme-toggle/, '首页应提供深色模式按钮');
const hasPublishedPost = /\/thought-garden\/\d{4}\/\d{2}\//.test(home);
if (!hasPublishedPost) {
  assert.equal((home.match(/<article\b/gi) || []).length, 0, '空博客不应渲染文章卡片');
  assert.match(home, /这里还没有文章/, '空博客应显示友好提示');
} else {
  assert.ok((home.match(/<article\b/gi) || []).length >= 1, '首页应显示文章');
  assert.match(home, /\/thought-garden\/\d{4}\/\d{2}\//, '首页应链接到文章详情');
}

const scriptFiles = fs.readdirSync('public/js');
assert.ok(scriptFiles.some((name) => name.endsWith('.js')), '缺少主题脚本');
const cssFiles = fs.readdirSync('public/css');
assert.ok(cssFiles.some((name) => name.endsWith('.css')), '缺少样式文件');

console.log('✓ Hugo 构建产物测试全部通过');
