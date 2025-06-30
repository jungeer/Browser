# 🎨 SCSS 使用指南

## 📚 概述

项目现已支持 SCSS（Sass），提供强大的样式预处理功能，包括变量、混入（mixins）、嵌套规则等现代 CSS 特性。

## 🚀 快速开始

### 1. 文件结构
```
src/renderer/styles/
├── variables.scss    # 全局变量定义
├── mixins.scss      # 混入（Mixins）工具库
└── example.scss     # 使用示例（可删除）
```

### 2. 在 Vue 组件中使用 SCSS

```vue
<template>
  <div class="my-component">
    <h1 class="title">Hello SCSS!</h1>
    <button class="primary-btn">点击我</button>
  </div>
</template>

<style lang="scss" scoped>
// 🎯 自动导入的变量和 mixins 可直接使用
.my-component {
  padding: $spacing-xl;
  background: $background-color;
  
  .title {
    color: $primary-color;
    font-size: $font-size-xl;
    margin-bottom: $spacing-lg;
  }
  
  .primary-btn {
    @include button-primary;
    padding: $spacing-md $spacing-xl;
  }
}
</style>
```

## 🎯 核心特性

### 📝 变量系统

#### 🌈 颜色变量
```scss
// 主题颜色
$primary-color: #007acc;
$primary-hover: #005a9e;
$secondary-color: #f5f5f5;

// 界面颜色
$background-color: #ffffff;
$text-primary: #333;
$text-secondary: #666;

// 状态颜色
$success-color: #28a745;
$warning-color: #ffc107;
$error-color: #dc3545;
```

#### 📏 尺寸变量
```scss
// 组件高度
$toolbar-height: 50px;
$tab-height: 36px;
$status-bar-height: 24px;

// 间距系统
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;
$spacing-xl: 24px;
```

#### 🔤 字体变量
```scss
$font-size-sm: 12px;
$font-size-base: 14px;
$font-size-lg: 16px;
$font-size-xl: 18px;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;
```

### 🛠️ Mixins 工具库

#### 🎯 布局 Mixins
```scss
// Flexbox 布局
.container {
  @include flex-center;     // 居中对齐
  @include flex-between;    // 两端对齐
  @include flex-start;      // 起始对齐
}
```

#### 🎨 按钮 Mixins
```scss
.my-button {
  @include button-primary;    // 主要按钮样式
  @include button-secondary;  // 次要按钮样式
}
```

#### 📦 输入框 Mixins
```scss
.my-input {
  @include input-base;  // 基础输入框样式
}
```

#### 📱 响应式 Mixins
```scss
.responsive-element {
  font-size: $font-size-lg;
  
  @include mobile {
    font-size: $font-size-base;  // 移动端样式
  }
  
  @include tablet {
    font-size: $font-size-md;    // 平板端样式
  }
}
```

#### 🌟 效果 Mixins
```scss
.card {
  @include card-shadow;      // 卡片阴影
  @include hover-lift;       // 悬停提升效果
  @include text-ellipsis;    // 文本省略号
}
```

## 🎨 实际应用示例

### 1. 创建现代按钮组
```scss
.button-group {
  @include flex-start;
  gap: $spacing-sm;
  
  .btn {
    @include button-base;
    padding: $spacing-sm $spacing-md;
    
    &.primary {
      @include button-primary;
    }
    
    &.secondary {
      @include button-secondary;
    }
    
    &.large {
      padding: $spacing-md $spacing-xl;
      font-size: $font-size-lg;
    }
  }
}
```

### 2. 响应式卡片组件
```scss
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $spacing-lg;
  padding: $spacing-xl;
  
  .card {
    background: $background-color;
    border-radius: $border-radius-lg;
    padding: $spacing-xl;
    @include card-shadow;
    @include hover-lift;
    
    .card-title {
      color: $text-primary;
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      margin-bottom: $spacing-md;
      @include text-ellipsis;
    }
    
    .card-content {
      color: $text-secondary;
      line-height: 1.6;
      @include text-multiline-ellipsis(3);
    }
    
    @include mobile {
      padding: $spacing-lg;
      
      .card-title {
        font-size: $font-size-lg;
      }
    }
  }
}
```

### 3. 表单组件
```scss
.form {
  max-width: 500px;
  margin: 0 auto;
  
  .form-group {
    margin-bottom: $spacing-lg;
    
    .label {
      display: block;
      font-weight: $font-weight-medium;
      color: $text-primary;
      margin-bottom: $spacing-xs;
    }
    
    .input {
      @include input-base;
      width: 100%;
      
      &.error {
        border-color: $error-color;
        @include focus-ring;
      }
    }
    
    .help-text {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-top: $spacing-xs;
      
      &.error {
        color: $error-color;
      }
    }
  }
  
  .submit-btn {
    @include button-primary;
    width: 100%;
    padding: $spacing-md;
    margin-top: $spacing-lg;
  }
}
```

## 🔧 高级技巧

### 1. 嵌套规则
```scss
.navigation {
  background: $surface-color;
  
  .nav-list {
    @include flex-start;
    list-style: none;
    
    .nav-item {
      margin-right: $spacing-md;
      
      .nav-link {
        color: $text-primary;
        text-decoration: none;
        transition: color $transition-base;
        
        &:hover {
          color: $primary-color;
        }
        
        &.active {
          color: $primary-color;
          font-weight: $font-weight-medium;
        }
      }
    }
  }
}
```

### 2. 使用计算值
```scss
.layout {
  // 使用已定义的变量进行计算
  height: calc(100vh - #{$header-total-height});
  padding: $spacing-lg * 2;  // 计算间距
  
  // 使用函数
  background: rgba($primary-color, 0.1);
}
```

### 3. 条件逻辑
```scss
@mixin button-variant($variant: 'primary') {
  @include button-base;
  
  @if $variant == 'primary' {
    background: $primary-color;
    color: white;
  } @else if $variant == 'secondary' {
    background: $secondary-color;
    color: $text-primary;
  } @else if $variant == 'success' {
    background: $success-color;
    color: white;
  }
}

.btn-primary { @include button-variant('primary'); }
.btn-secondary { @include button-variant('secondary'); }
.btn-success { @include button-variant('success'); }
```

## 🎯 最佳实践

### 1. 文件组织
- ✅ 使用语义化的变量名
- ✅ 将相关的样式分组
- ✅ 保持 mixin 的单一职责
- ✅ 使用注释说明复杂逻辑

### 2. 性能优化
- ✅ 避免过度嵌套（建议不超过3层）
- ✅ 合理使用 mixin，避免代码膨胀
- ✅ 使用 `scoped` 限制样式作用域

### 3. 维护性
- ✅ 统一使用项目定义的变量
- ✅ 遵循命名约定
- ✅ 定期清理未使用的样式

## 🚀 与现有样式的整合

现有的 `style.css` 可以逐步迁移到 SCSS：

1. **重命名文件**：`style.css` → `style.scss`
2. **替换硬编码值**：用变量替换具体的数值
3. **应用 mixins**：使用预定义的 mixins 简化代码
4. **添加嵌套**：合理使用嵌套规则

## 📝 注意事项

1. **自动导入**：变量和 mixins 已全局可用，无需手动导入
2. **作用域**：在 Vue 组件中使用 `scoped` 限制样式作用域
3. **编译**：SCSS 会自动编译为 CSS，无需额外配置
4. **调试**：开发时可以看到 source map，便于调试

## 🎉 开始使用

现在您可以在任何 Vue 组件中使用 SCSS 了！只需：

1. 在 `<style>` 标签中添加 `lang="scss"`
2. 直接使用预定义的变量和 mixins
3. 享受强大的 SCSS 功能！

```vue
<style lang="scss" scoped>
.my-awesome-component {
  @include flex-center;
  background: $primary-color;
  padding: $spacing-xl;
  border-radius: $border-radius-lg;
  @include hover-lift;
}
</style>
```

🎨 **开始创建美丽的样式吧！** 