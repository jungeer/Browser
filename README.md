# Vue Electron Browser

一个基于 Electron 和 Vue3 的简单浏览器客户端，支持多标签页浏览、导航控制等基本浏览器功能。

## 功能特性

- 🌐 多标签页浏览
- 🔄 前进、后退、刷新功能
- 📱 现代化 UI 设计
- 🖥️ 跨平台支持（Windows、macOS）
- ⚡ 基于 Vue3 + Vite 快速开发
- 🔧 完整的菜单栏集成

## 技术栈

- **前端框架**: Vue3 (Composition API + `<script setup>`)
- **桌面应用**: Electron
- **构建工具**: Vite
- **样式预处理**: SCSS/Sass + PostCSS + Autoprefixer
- **包管理**: npm
- **打包工具**: electron-builder

## 项目结构

```
navigator/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── main.js       # 主进程入口
│   │   └── preload.js    # 预加载脚本
│   └── renderer/         # Vue 渲染进程
│       ├── App.vue       # 主组件 (Vue3 script setup)
│       ├── main.js       # Vue 应用入口
│       ├── style.css     # 全局样式文件
│       └── styles/       # SCSS 样式系统 🎨
│           ├── variables.scss  # 全局变量定义
│           ├── mixins.scss    # Mixins 工具库
│           └── example.scss   # 使用示例
├── index.html            # HTML 模板
├── vite.config.js        # Vite 配置 (支持SCSS)
├── postcss.config.js     # PostCSS 配置
└── package.json          # 项目配置
```

## 开发环境搭建

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式运行

```bash
npm run dev
```

这个命令会同时启动 Vite 开发服务器和 Electron 应用。

### 3. 单独运行 Vue 开发服务器

```bash
npm run dev:vue
```

### 4. 单独运行 Electron（需要先启动 Vue 服务器）

```bash
npm run electron
```

## 构建和打包

### 1. 构建 Vue 应用

```bash
npm run build
```

### 2. 打包为不同平台的应用

```bash
# 打包为 Windows 应用
npm run build:win

# 打包为 macOS 应用
npm run build:mac

# 同时打包为 Windows 和 macOS 应用
npm run build:all
```

打包后的文件将输出到 `dist` 目录。

## 使用说明

### 基本操作

1. **导航**: 在地址栏输入网址或搜索关键词，按回车或点击"跳转"按钮
2. **标签页管理**: 
   - 点击 "+" 按钮添加新标签页
   - 点击 "×" 按钮关闭标签页
   - 点击标签页标题切换标签页
3. **浏览控制**: 使用工具栏的前进、后退、刷新按钮

### 快捷键

- `Ctrl/Cmd + T`: 新建标签页
- `Ctrl/Cmd + W`: 关闭当前标签页
- `Alt + ←`: 后退
- `Alt + →`: 前进
- `Ctrl/Cmd + R`: 刷新页面
- `F12`: 开发者工具

## 开发注意事项

### 安全性配置

项目采用了 Electron 的安全最佳实践：
- 禁用了 Node.js 集成（`nodeIntegration: false`）
- 启用了上下文隔离（`contextIsolation: true`）
- 使用预加载脚本安全地暴露 API

### webview 标签

项目使用了 `<webview>` 标签来嵌入网页内容，这提供了更好的隔离性和控制能力。

### SCSS 样式系统 🎨

项目现已支持 SCSS 预处理器，提供强大的样式开发能力：

#### 快速使用
```vue
<style lang="scss" scoped>
.my-component {
  @include flex-center;           // 使用 mixins
  background: $primary-color;     // 使用变量
  padding: $spacing-xl;
  border-radius: $border-radius-lg;
}
</style>
```

#### 主要特性
- 🎯 **全局变量**: 颜色、尺寸、字体等设计标准
- 🛠️ **Mixins 工具库**: 按钮、布局、响应式等常用样式
- 📱 **响应式支持**: 移动端、平板、桌面端适配
- 🎨 **现代化设计**: 阴影、动画、主题色等效果
- 🔧 **自动导入**: 变量和 mixins 全局可用

#### 详细文档
- 📖 [SCSS使用指南.md](./SCSS使用指南.md) - 完整使用文档
- 💡 查看 `src/renderer/styles/example.scss` 了解示例用法

## 系统要求

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本

## 兼容性

- **Windows**: Windows 7 及以上版本
- **macOS**: macOS 10.10 及以上版本

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 更新日志

### v1.1.1 (最新)
- 🎨 新增完整的 SCSS 样式系统支持
- 📝 添加全局变量和 Mixins 工具库
- 🔧 配置 PostCSS 和 Autoprefixer
- 📖 完善 SCSS 使用文档和示例

### v1.1.0
- ✨ 升级到 Vue3 `<script setup>` 语法
- 🐛 彻底修复 WebView 高度填充问题
- 🎯 优化响应式布局和窗口适配
- 📱 改进多标签页切换体验

### v1.0.0
- 初始版本发布
- 基本浏览器功能实现
- 多标签页支持
- 跨平台打包支持 