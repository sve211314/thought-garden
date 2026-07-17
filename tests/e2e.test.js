const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');

const root = path.resolve('public');
const basePath = '/thought-garden';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.xml': 'application/xml' };

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const stripped = pathname.startsWith(basePath) ? pathname.slice(basePath.length) || '/' : pathname;
  const relative = stripped.endsWith('/') ? `${stripped}index.html` : stripped;
  const file = path.resolve(root, `.${relative}`);
  if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});

server.listen(0, '127.0.0.1', async () => {
  try {
    const { port } = server.address();
    const origin = `http://127.0.0.1:${port}`;
    const homeResponse = await fetch(`${origin}${basePath}/`);
    assert.equal(homeResponse.status, 200);
    const home = await homeResponse.text();
    assert.match(home, /思绪花园/);

    const postPath = home.match(/href=(?:["']([^"']*\/\d{4}\/\d{2}\/[^"']+\/)["']|([^\s>]*\/\d{4}\/\d{2}\/[^\s>]+\/))/)?.slice(1).find(Boolean);
    if (!postPath) {
      assert.match(home, /这里还没有文章/);
      const listResponse = await fetch(`${origin}${basePath}/posts/`);
      assert.equal(listResponse.status, 200);
      assert.match(await listResponse.text(), /这里还没有内容/);
    } else {
      const postResponse = await fetch(new URL(postPath, origin));
      assert.equal(postResponse.status, 200);
      const post = await postResponse.text();
      assert.match(post, /class=(?:["'][^"']*\bprose\b[^"']*["']|prose(?:\s|>))/);
      assert.equal((post.match(/<h1\b/gi) || []).length, 1);
    }

    const assetPaths = [...home.matchAll(/(?:href|src)=(?:["']([^"']+\.(?:css|js))["']|([^\s>]+\.(?:css|js)))/g)]
      .map((match) => match[1] || match[2]);
    assert.ok(assetPaths.length >= 2, '首页应加载 CSS 和 JavaScript');
    for (const asset of assetPaths) assert.equal((await fetch(new URL(asset, origin))).status, 200, `资源无法访问：${asset}`);

    assert.equal((await fetch(`${origin}${basePath}/not-found-test/`)).status, 404);
    console.log('✓ Hugo HTTP E2E 测试全部通过');
  } finally {
    server.close();
  }
});
