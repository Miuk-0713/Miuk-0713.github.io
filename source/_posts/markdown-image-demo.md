---
title: Hexo 文章本地图片引用指南
date: 2026-09-03 12:00:00
tags:
  - Hexo
  - Markdown
  - 图片管理
categories:
  - 技术折腾
  - 博客技巧
excerpt: 详解 Hexo post_asset_folder 机制，实现文章与图片的一体化管理，告别路径烦恼。
---

## 什么是 Post Asset Folder？

Hexo 提供了 **文章同名资源文件夹** 机制：当 `_config.yml` 中设置 `post_asset_folder: true` 后，每次执行 `hexo new "文章标题"` 时，Hexo 会自动创建与文章同名的文件夹。

```
source/_posts/
├── markdown-image-demo.md          # 文章 Markdown
└── markdown-image-demo/            # 同名资源文件夹
    └── demo-screenshot.svg         # 文章专用图片
```

在文章中，你可以直接使用文件名引用图片，无需写完整路径：

```markdown
![演示截图](demo-screenshot.svg)
```

渲染后 Hexo 会自动将相对路径解析为正确的 URL。

---

## 实际效果展示

下面这张图片就存放在本文的同名资源文件夹中：

![演示截图](demo-screenshot.svg)

图片已成功渲染！✅

---

## 日常写作标准操作流程

### 步骤一：创建文章

```bash
hexo new "我的新文章"
```

此命令会同时生成：
- `source/_posts/我的新文章.md`
- `source/_posts/我的新文章/`（空文件夹）

### 步骤二：截图并粘贴

1. 使用系统截图工具（如 Snipaste、ShareX、macOS 截图）截取所需画面
2. 将截图保存（或粘贴）到同名文件夹 `我的新文章/` 中
3. 建议文件名使用英文与连字符，如 `architecture-overview.png`

### 步骤三：在文章中引用

```markdown
![架构总览](architecture-overview.png)
```

> **提示**：如果你使用 VS Code + Markdown Preview Enhanced 插件，可以在设置中开启 `imagePaste` 扩展，实现截图后直接 Ctrl+V 粘贴到同名目录并自动插入 Markdown 引用语法。

---

## 常见问题

### Q：为什么图片在本地预览时无法显示？

确保 `hexo server` 正在运行。Hexo 的资源路径解析依赖渲染管线，直接用文件管理器打开 Markdown 文件是无法看到图片的。

### Q：可以使用子目录组织图片吗？

可以。在同名文件夹内创建子目录后，引用时需包含子目录路径：

```markdown
![图片](sub-folder/image.png)
```

### Q：与全局 `/img/` 目录有何区别？

| 方式 | 适用场景 | 优点 | 缺点 |
|:---|:---|:---|:---|
| **同名文件夹** | 文章专属配图 | 随文章移动/删除，不残留孤儿文件 | 每篇文章需独立目录 |
| **`/img/` 全局目录** | 全站共享资源（头像、图标） | 多篇文章可复用 | 删除文章时需手动清理 |

---

> **最佳实践**：文章配图用同名文件夹，全站共享资源放 `source/img/`，各司其职，井然有序。