const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

const slug = `ci-fixture-${process.pid}-${Date.now()}`;
const fixture = path.resolve(`content/posts/${slug}.md`);
const commands = [
  ['tests/hugo-structure.test.js'],
  ['scripts/build.js'],
  ['tests/build-output.test.js'],
  ['tests/e2e.test.js'],
];

fs.writeFileSync(fixture, `---
title: "CI 临时文章"
date: 2026-01-02T09:00:00+08:00
slug: "${slug}"
description: "验证博客存在文章时仍能正确构建。"
tags: ["测试"]
categories: ["测试"]
draft: false
---

这篇文章只在测试期间存在。
`);

try {
  for (const args of commands) {
    const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
    assert.equal(result.status, 0, `测试命令失败：node ${args.join(' ')}`);
  }
  assert.ok(fs.existsSync(`public/2026/01/${slug}/index.html`), '临时文章详情页未生成');
  console.log('✓ 有文章场景测试全部通过');
} finally {
  fs.rmSync(fixture, { force: true });
  const rebuild = spawnSync(process.execPath, ['scripts/build.js'], { stdio: 'inherit' });
  if (rebuild.status !== 0) process.exitCode = rebuild.status;
}
