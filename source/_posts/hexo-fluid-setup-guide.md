---
title: 基于 Hexo 与 Fluid 的个人技术博客搭建指南
date: 2026-09-03 10:00:00
tags:
  - Hexo
  - Fluid
  - 静态博客
  - 前端工程化
categories:
  - 技术折腾
  - 网站建设
excerpt: 记录基于 Hexo 框架与 Fluid 主题搭建个人独立博客、配置自动化流水线及个性化定制的完整实践。
comments: true
---

## 一、架构选型背景

在个人技术博客的搭建过程中，我曾对比过多种主流方案：

| 方案 | 优势 | 劣势 |
| :--- | :--- | :--- |
| **WordPress** | 生态成熟、插件丰富 | 需要服务器、运维成本高 |
| **Hugo** | 构建极快 | 模板语法学习曲线陡 |
| **Gatsby** | React 生态、功能强大 | 构建慢、Node 依赖重 |
| **Hexo + Fluid** | 轻量、中文友好、主题精美 | 插件生态略小于 WordPress |

最终选择 **Hexo + Fluid** 的组合，理由如下：

1. **零运维**：纯静态站点，可直接部署至 GitHub Pages，无需服务器。
2. **中文优先**：Fluid 主题对中文排版做了深度优化，行距、字号、字体回退链均适配中文阅读习惯。
3. **开箱即用**：内置代码复制、搜索、打字机动效、暗色模式等常用功能，无需手动集成。
4. **可扩展**：通过 `_config.fluid.yml` 覆盖配置，升级主题不丢失自定义。

---

## 二、核心命令与目录解析

### 2.1 项目初始化

```bash
# 全局安装 Hexo CLI
npm install hexo-cli -g

# 创建站点骨架
hexo init my-blog
cd my-blog

# 安装 Fluid 主题（npm 方式，推荐）
npm install hexo-theme-fluid --save

# 安装全站搜索索引生成器
npm install hexo-generator-searchdb --save
```

### 2.2 目录结构一览

```
my-blog/
├── _config.yml              # 站点主配置
├── _config.fluid.yml        # Fluid 主题覆盖配置
├── package.json             # 依赖声明
├── scaffolds/               # 文章模板
├── source/                  # 内容源文件
│   ├── _posts/              # 博客文章（Markdown）
│   ├── categories/
│   │   └── index.md         # 分类页
│   ├── tags/
│   │   └── index.md         # 标签页
│   └── about/
│       └── index.md         # 关于页
├── themes/                  # 主题目录（git clone 方式）
└── public/                  # 构建产物（由 hexo g 生成）
```

> **关键概念**：`source/` 下的 Markdown 文件经 Hexo 渲染后输出到 `public/`，最终由 GitHub Pages 托管。

### 2.3 常用命令速查

```bash
hexo new "文章标题"          # 新建文章
hexo server                  # 本地预览（默认 http://localhost:4000）
hexo generate                # 生成静态文件
hexo deploy                  # 部署至远程仓库
hexo clean                   # 清除缓存与构建产物
```

---

## 三、Fluid 主题个性化配置

### 3.1 导航栏与首页标语

在 `_config.fluid.yml` 中设置：

```yaml
navbar:
  blog_title: "Miuk's Space"

index:
  slogan:
    enable: true
    text: "代码即诗，行胜于言。"
    typing:
      enable: true
      loop: true
```

### 3.2 代码块一键复制

```yaml
code:
  copy_btn: true
```

启用后，每段代码块右上角会出现复制按钮，读者一键即可复制代码。

### 3.3 全站搜索

```yaml
search:
  enable: true
  path: /search.xml
  field: post
  content: true
  format: html
```

配合 `hexo-generator-searchdb` 插件，导航栏搜索框即可对全站文章标题、标签、正文进行实时检索。

---

## 四、Fluid 便签语法展示

Fluid 主题提供了丰富的便签（Note）标签，可在文章中插入带样式的提示框，增强可读性：

### 4.1 基础便签

```
{% note default %}
这是一条默认样式的便签，用于一般性说明。
{% endnote %}

{% note primary %}
这是一条主要样式的便签，用于强调关键信息。
{% endnote %}

{% note success %}
配置成功！全站搜索已启用，现在可以在导航栏输入关键词进行检索。
{% endnote %}

{% note info %}
提示：修改 _config.fluid.yml 后需执行 hexo clean && hexo g 重新构建才能生效。
{% endnote %}

{% note warning %}
注意：_config.fluid.yml 中的配置会覆盖主题默认值，升级主题前请备份此文件。
{% endnote %}

{% note danger %}
危险：切勿将包含密钥或 Token 的文件提交至公开仓库！
{% endnote %}
```

### 4.2 带标题便签

```
{% note success '部署成功' %}
站点已成功部署至 GitHub Pages，访问地址：https://miuk-0713.github.io
{% endnote %}
```

### 4.3 其他实用标签

```
{% label primary @Hexo %} {% label success @Fluid %} {% label info @GitHub Pages %}

{% checkbox true @已完成 %} 主题安装与配置
{% checkbox true @已完成 %} 全站搜索启用
{% checkbox false @待完成 %} 自定义 404 页面
{% checkbox false @待完成 %} 接入 Google Analytics
```

---

## 五、部署流水线

### 5.1 GitHub Actions 自动部署

在 `.github/workflows/deploy.yml` 中配置 CI/CD：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npx hexo clean
      - run: npx hexo generate
      - uses: peaceiris/actions-hexo-deploy@v3
        with:
          deploy_key: ${{ secrets.DEPLOY_KEY }}
          user_name: miuk-0713
          user_email: miuk@example.com
```

每次向 `main` 分支推送代码，Actions 将自动构建并发布站点，实现**提交即部署**的自动化体验。

---

## 六、总结与后续规划

### 回顾

本文完整记录了基于 Hexo + Fluid 搭建个人技术博客的核心流程：

1. **选型**：对比多种方案后确定 Hexo + Fluid 组合
2. **搭建**：初始化项目、安装主题与搜索插件
3. **配置**：导航栏、打字机动效、代码复制、全站搜索
4. **内容**：利用 Fluid 便签语法增强文章表现力
5. **部署**：GitHub Actions 实现自动化流水线

### 后续规划清单

- [ ] 接入 **Gitalk** 或 **Waline** 评论系统
- [ ] 配置自定义 **404 页面**（公益 404）
- [ ] 接入 **Google Analytics** / **百度统计** 进行流量分析
- [ ] 使用 **hexo-abbrlink** 替换默认 permalink，生成短链
- [ ] 为文章添加 **LaTeX 数学公式** 支持（MathJax / KaTeX）
- [ ] 探索 **hexo-douban** 插件同步豆瓣书影音数据
- [ ] 编写 **自定义 Fluid 页面模板**（如读书笔记、项目展示）
- [ ] 优化 **Lighthouse** 评分，提升 SEO 与性能指标

---

> **"代码即诗，行胜于言。"** — 搭建博客只是起点，持续输出优质内容才是终点。