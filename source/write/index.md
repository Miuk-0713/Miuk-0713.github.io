---
title: 在线写作台
layout: page
comments: false
---

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<link rel="stylesheet" href="/css/write-page.css">
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>

<div class="write-wrap">
<div class="write-hero">
<h1>在线写作台</h1>
<p>撰写 Markdown 文章，一键发布到 GitHub Pages</p>
</div>
<div class="write-card">
<div class="write-card-title">
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
文章信息
</div>
<div class="write-row">
<div class="write-field">
<label>文章标题</label>
<input type="text" id="w-title" placeholder="例如：我的第一篇技术博客">
</div>
<div class="write-field">
<label>英文文件名（用于 URL）</label>
<input type="text" id="w-slug" placeholder="例如：my-first-tech-blog">
</div>
</div>
<div class="write-row">
<div class="write-field">
<label>分类</label>
<input type="text" id="w-category" placeholder="例如：技术笔记">
</div>
<div class="write-field">
<label>标签（半角逗号分隔）</label>
<input type="text" id="w-tags" placeholder="例如：JavaScript,前端,教程">
</div>
</div>
<div class="write-row full">
<div class="write-field">
<label>摘要（首页卡片预览，建议 50~100 字）</label>
<textarea id="w-excerpt" rows="2" placeholder="简短描述文章核心内容..."></textarea>
</div>
</div>
<div class="write-row full">
<div class="write-field">
<label>Markdown 正文</label>
<textarea id="w-content" class="md-editor" placeholder="在此撰写 Markdown 正文..."></textarea>
</div>
</div>
<div class="write-status-bar">
<span id="w-charcount">共 0 字</span>
<span id="w-datetime"></span>
</div>
<div class="write-token-section">
<div class="write-token-toggle" id="w-token-toggle">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
GitHub 发布配置
</div>
<div class="write-token-body" id="w-token-body">
<div class="write-field">
<label>GitHub Personal Access Token (PAT)</label>
<input type="password" id="w-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx">
</div>
<p class="hint">
Token 仅保存在浏览器 localStorage 中，不会发送到任何第三方服务。<br>
所需权限：<code>repo</code>（完整仓库读写）。<br>
<a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener">前往 GitHub 创建 Token →</a>
</p>
</div>
</div>
</div>
<div class="write-actions">
<button class="write-btn write-btn-outline" id="w-preview-btn">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
实时预览
</button>
<button class="write-btn write-btn-outline" id="w-fm-btn">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 18 22 2 8 2 8 18"/><path d="M2 22h14v-4H2z"/></svg>
查看 Front-matter
</button>
<button class="write-btn write-btn-primary" id="w-publish-btn">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
一键发布到 GitHub
</button>
</div>
<div class="write-frontmatter-preview" id="w-fm-preview"></div>
<div class="write-preview-panel" id="w-preview-panel">
<div class="preview-title">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
实时预览
</div>
<div class="write-preview-content" id="w-preview-content"></div>
</div>
</div>
<div class="write-toast" id="w-toast"></div>
<script src="/js/write-page.js"></script>