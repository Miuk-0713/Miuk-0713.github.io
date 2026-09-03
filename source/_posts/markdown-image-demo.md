---
title: Hexo 文章图片引用指南
date: 2026-09-03 12:00:00
tags:
  - Hexo
  - Markdown
  - 图片管理
categories:
  - 技术折腾
  - 博客技巧
excerpt: 详解 Hexo 图片路径解析机制，统一使用绝对根路径引用，彻底避免 Fancybox 灯箱 404 异常。
comments: true
---

## 图片路径解析原理

Hexo 渲染 Markdown 图片时，路径解析取决于引用方式：

| 引用方式 | 渲染结果 | 是否可靠 |
| :--- | :--- | :--- |
| `![](image.png)` | 依赖 `post_asset_folder`，路径易偏移 | ⚠️ 不稳定 |
| `![](/img/posts/image.png)` | 绝对根路径，精准解析 | ✅ 推荐 |

**推荐方案**：将文章配图统一存放在 `source/img/posts/` 目录，使用绝对根路径 `/img/posts/xxx` 引用。无论本地预览还是生产部署，路径始终正确，Fancybox 灯箱也能精准加载大图。

---

## 目录结构

```
source/
├── img/
│   ├── favicon.svg              # 站点图标
│   ├── avatar.svg               # 个人头像
│   └── posts/                   # 文章配图（统一存放）
│       └── demo-screenshot.svg  # 示例截图
├── _posts/
│   ├── my-article.md            # 文章中引用：![](/img/posts/demo-screenshot.svg)
│   └── ...
```

---

## 实际效果展示

下面这张图片存放在 `source/img/posts/` 目录中，使用绝对根路径引用：

![演示截图](/img/posts/demo-screenshot.svg)

图片已成功渲染！✅

---

## 日常写作标准操作流程

### 步骤一：截图并保存

1. 使用系统截图工具（如 Snipaste、ShareX、macOS 截图）截取所需画面
2. 将截图保存到 `source/img/posts/` 目录
3. 建议文件名使用英文与连字符，如 `architecture-overview.png`

### 步骤二：在文章中引用

```markdown
![架构总览](/img/posts/architecture-overview.png)
```

> **关键**：路径以 `/` 开头，表示从站点根目录开始，确保本地预览与 GitHub Pages 部署后路径一致。

### 步骤三：本地验证

```bash
npx hexo server
# 浏览器打开 http://localhost:4000，确认图片正常显示
# 点击图片，确认 Fancybox 灯箱正常弹窗
```

---

## 常见问题

### Q：为什么之前用同名文件夹引用会 404？

Hexo 的 `post_asset_folder` 机制依赖渲染器对相对路径的自动改写，但 `hexo-renderer-marked` 的路径解析在某些场景下会产生偏移，导致渲染后的 `src` 指向错误路径。Fancybox 灯箱按此错误路径加载大图，自然 404。

使用绝对根路径 `/img/posts/xxx` 完全绕过此问题。

### Q：`source/img/posts/` 和 `source/img/` 有何区别？

| 目录 | 用途 | 示例 |
| :--- | :--- | :--- |
| `source/img/` | 全站共享资源 | favicon、avatar、default banner |
| `source/img/posts/` | 文章配图 | 截图、架构图、流程图 |

### Q：图片命名有什么规范？

- 使用英文小写 + 连字符：`my-feature-overview.png`
- 可加文章前缀避免冲突：`setup-guide-architecture.png`
- 推荐格式：SVG（矢量图）或 WebP（压缩率高）

---

> **最佳实践**：文章配图统一放 `source/img/posts/`，引用统一用 `/img/posts/xxx` 绝对根路径，Fancybox 灯箱永不 404。