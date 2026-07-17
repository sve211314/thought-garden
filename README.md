# 思绪花园

一个使用 [Hugo](https://gohugo.io/) 构建的中文个人博客。视觉主题为仓库内自定义实现，不依赖第三方主题、字体、分析脚本或追踪服务。

在线浏览：<https://sve211314.github.io/thought-garden/>

## 写一篇新文章

```bash
hugo new content posts/my-new-post.md
```

打开生成的 `content/posts/my-new-post.md`：

```markdown
---
title: "文章标题"
date: 2026-07-17T20:00:00+08:00
description: "一两句话介绍这篇文章。"
tags: ["生活", "思考"]
categories: ["随笔"]
draft: true
---

从这里开始写正文。
```

写好后把 `draft` 改为 `false`，提交并推送到 `main`，GitHub Actions 会自动更新网站。

## 本地预览

安装 Hugo Extended 0.164.0 或更新版本，然后运行：

```bash
hugo server --buildDrafts
```

浏览器打开终端显示的本地地址。草稿只会在带 `--buildDrafts` 时显示。

## 检查与构建

```bash
npm test
npm run build
```

测试覆盖 Hugo 源码结构、生产构建产物、内部资源路径及 HTTP 冒烟流程。生产文件生成到 `public/`，该目录不会提交到 Git。

## 内容与页面

- `content/posts/`：Markdown 文章
- `content/about.md`：关于页
- `content/archives/_index.md`：时间归档
- `layouts/`：Hugo 页面模板
- `assets/css/main.css`：自定义视觉主题
- `assets/js/theme.js`：明暗模式切换
- `.github/workflows/hugo.yaml`：GitHub Pages 自动部署

网站自动生成文章列表、正文页、标签、分类、归档、RSS 和 404 页面。
