const fs = require('node:fs');
const assert = require('node:assert/strict');

assert.ok(fs.existsSync('index.html'), 'index.html 应存在');

const html = fs.readFileSync('index.html', 'utf8');

assert.ok(html.trim().length > 500, '页面内容过少');
assert.match(html, /<!doctype html>/i);
assert.match(html, /<html[^>]+lang=["']zh-CN["']/i);
assert.match(html, /<meta[^>]+charset=["']?utf-8/i);
assert.match(html, /<meta[^>]+name=["']viewport["']/i);
assert.match(html, /<title>[^<]*思绪花园[^<]*<\/title>/i);
assert.match(html, /<h1[^>]*>[\s\S]*?思绪花园[\s\S]*?<\/h1>/i);
assert.match(html, /<main\b/i);
assert.equal((html.match(/<h1\b/gi) || []).length, 1, '必须恰好有一个 h1');
assert.ok((html.match(/<article\b/gi) || []).length >= 3, '至少需要 3 张思绪卡片');
assert.match(html, /@media\s*\([^)]*(max-width|min-width)/i, '需要响应式断点');
assert.match(html, /prefers-reduced-motion/i, '需照顾减少动态效果偏好');
assert.doesNotMatch(html, /(?:src|href)=["'](?:file:|\/Users\/|[A-Za-z]:\\)/i);
assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i, '不应加载外部脚本');
assert.doesNotMatch(html, /(?:src|href)=["']https?:\/\//i, '不应加载外部资源');
assert.doesNotMatch(html, /url\(\s*["']?https?:\/\//i, 'CSS 不应加载外部资源');
assert.doesNotMatch(html, /<iframe\b/i, '不应嵌入第三方页面');
assert.doesNotMatch(html, /(?:TODO|console\.log|href=["']#["'])/i);
assert.doesNotMatch(html, /(?:api[_-]?key|secret|token)\s*[:=]\s*["'][^"']+/i);

console.log('✓ 静态页面契约测试全部通过');
