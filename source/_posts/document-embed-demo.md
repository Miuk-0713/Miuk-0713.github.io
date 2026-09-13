---
title: 文档嵌入与下载卡片演示
date: 2026-09-11 12:00:00
tags:
  - 教程
  - PDF
  - 文档
categories:
  - 博客功能
excerpt: 演示如何在 Hexo 博客中内嵌 PDF 在线阅读器，以及使用文档下载卡片提供文件下载。
index_img: /img/posts/default-cover.png
math: false
comments: true
---

<link rel="stylesheet" href="/css/write-page.css">

## 1、PDF 在线翻页阅读

在博客文章中，你可以使用标准 HTML `<iframe>` 或 `<embed>` 标签将 PDF 文档内嵌展示。读者无需下载即可在页面中翻页、缩放和全屏阅读。

### 1.1 使用 iframe 嵌入

```html
<div class="doc-embed-wrap">
  <iframe src="/files/sample.pdf" width="100%" height="600"
    style="border:1px solid #e2e8f0;border-radius:8px;">
  </iframe>
</div>
```

**效果如下：**

<div class="doc-embed-wrap">
  <iframe src="/files/sample.pdf" width="100%" height="600"
    style="border:1px solid #e2e8f0;border-radius:8px;">
  </iframe>
</div>

### 1.2 使用 embed 标签

```html
<div class="doc-embed-wrap">
  <embed src="/files/sample.pdf" width="100%" height="600"
    type="application/pdf">
</div>
```

> **提示：** 移动端浏览器可能不支持内嵌 PDF 预览，建议同时提供下载链接作为备选方案。

---

## 2、文档下载卡片

对于 `.docx`、`.pdf`、`.zip` 等需要提供原始文件下载的场景，可以使用以下**文档下载卡片**样式，展示文件图标、名称、大小和下载按钮。

### 2.1 PDF 文件下载卡片

```html
<div class="doc-download-card">
  <div class="doc-download-icon pdf">PDF</div>
  <div class="doc-download-info">
    <p class="doc-download-name">sample.pdf</p>
    <p class="doc-download-meta">PDF 文档 · 12.3 KB</p>
  </div>
  <a class="doc-download-btn primary" href="/files/sample.pdf" download>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    点击下载
  </a>
</div>
```

**效果如下：**

<div class="doc-download-card">
  <div class="doc-download-icon pdf">PDF</div>
  <div class="doc-download-info">
    <p class="doc-download-name">sample.pdf</p>
    <p class="doc-download-meta">PDF 文档 · 12.3 KB</p>
  </div>
  <a class="doc-download-btn primary" href="/files/sample.pdf" download>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    点击下载
  </a>
</div>

### 2.2 Word 文档下载卡片

<div class="doc-download-card">
  <div class="doc-download-icon docx">DOC</div>
  <div class="doc-download-info">
    <p class="doc-download-name">课程讲义-大模型部署.docx</p>
    <p class="doc-download-meta">Word 文档 · 2.8 MB</p>
  </div>
  <a class="doc-download-btn primary" href="/files/sample.pdf" download>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    点击下载
  </a>
</div>

### 2.3 压缩包下载卡片

<div class="doc-download-card">
  <div class="doc-download-icon zip">ZIP</div>
  <div class="doc-download-info">
    <p class="doc-download-name">项目源码与资料.zip</p>
    <p class="doc-download-meta">压缩包 · 15.6 MB</p>
  </div>
  <a class="doc-download-btn primary" href="/files/sample.pdf" download>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    点击下载
  </a>
</div>

---

## 3、如何使用

### 3.1 上传文件

将需要嵌入或下载的文件放到 `source/files/` 目录下，Hexo 生成时会将其原样复制到 `public/files/`。

### 3.2 嵌入 PDF

在文章 Markdown 中插入 HTML 代码：

```html
<div class="doc-embed-wrap">
  <iframe src="/files/你的文件.pdf" width="100%" height="600"></iframe>
</div>
```

### 3.3 添加下载卡片

根据文件类型选择对应的图标样式类（`pdf` / `docx` / `zip` / `default`），修改文件名、大小和链接即可：

```html
<div class="doc-download-card">
  <div class="doc-download-icon pdf">PDF</div>
  <div class="doc-download-info">
    <p class="doc-download-name">你的文件名.pdf</p>
    <p class="doc-download-meta">PDF 文档 · 文件大小</p>
  </div>
  <a class="doc-download-btn primary" href="/files/你的文件名.pdf" download>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    点击下载
  </a>
</div>
```

> **注意：** 使用下载卡片样式需要在文章 front-matter 中引入 CSS：`<link rel="stylesheet" href="/css/write-page.css">`，或将其样式复制到主题的全局样式文件中。