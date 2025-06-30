<template>
  <div v-if="visible" class="settings-panel">
    <div class="settings-overlay" @click="closeSettings"></div>
    <div class="settings-content glass-card">
      <!-- 设置头部 -->
      <div class="settings-header">
        <div class="header-icon">✨</div>
        <h3>个性化设置</h3>
        <button @click="closeSettings" class="close-btn glass-button">×</button>
      </div>
      
      <div class="settings-body">
                 <!-- 主题设置区域 -->
         <div class="setting-section">
           <h4 class="section-title">🎨 视觉风格</h4>
          
                     <!-- 主题色选择 -->
           <div class="setting-group">
             <label class="setting-label">
               <span class="label-text">色彩风格</span>
             </label>
            <div class="theme-selector">
              <div 
                v-for="(theme, name) in availableThemes" 
                :key="name"
                :class="['theme-option', { active: currentTheme === name }]"
                @click="selectTheme(name)"
                :title="theme.displayName"
              >
                <div class="theme-preview" :style="{ background: theme.gradient }">
                  <div class="theme-name">{{ theme.icon }}</div>
                </div>
                <span class="theme-label">{{ theme.displayName }}</span>
              </div>
            </div>
          </div>
          
                     <!-- 界面风格选择 -->
           <div class="setting-group">
             <label class="setting-label">
               <span class="label-text">视觉效果</span>
             </label>
             <div class="style-selector">
               <div 
                 :class="['style-option', { active: uiStyle === 'glass' }]"
                 @click="selectStyle('glass')"
               >
                 <div class="style-preview glass-surface">
                   <div class="preview-content">轻盈</div>
                 </div>
                 <span>透明质感</span>
               </div>
               <div 
                 :class="['style-option', { active: uiStyle === 'neu' }]"
                 @click="selectStyle('neu')"
               >
                 <div class="style-preview neu-surface">
                   <div class="preview-content">立体</div>
                 </div>
                 <span>立体质感</span>
               </div>
             </div>
           </div>
        </div>
        
                 <!-- 窗口设置区域 -->
         <div class="setting-section">
           <h4 class="section-title">🪟 窗口效果</h4>
           
           <!-- 透明度设置 -->
           <div class="setting-group">
             <label class="setting-label">
               <span class="label-text">透明效果</span>
               <span class="label-value">{{ Math.round(opacity * 100) }}%</span>
             </label>
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                v-model="opacity"
                @input="updateOpacity"
                class="modern-slider opacity-slider"
              />
              <div class="slider-track"></div>
              <div class="slider-marks">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
                     <!-- 鼠标隐藏功能 -->
           <div class="setting-group">
             <label class="setting-label">
               <span class="label-text">智能隐身</span>
               <div class="modern-toggle" :class="{ active: mouseHideEnabled }" @click="toggleMouseHide">
                 <div class="toggle-thumb"></div>
                 <div class="toggle-bg"></div>
               </div>
             </label>
             <p class="setting-description">鼠标离开时自动隐身，专注不受打扰</p>
           </div>
          
          <!-- 隐藏延迟设置 -->
          <div v-if="mouseHideEnabled" class="setting-group">
            <label class="setting-label">
              <span class="label-text">隐藏延迟</span>
              <span class="label-value">{{ hideDelay }}ms</span>
            </label>
            <div class="slider-container">
              <input 
                type="range" 
                min="100" 
                max="2000" 
                step="100" 
                v-model="hideDelay"
                @input="updateHideDelay"
                class="modern-slider delay-slider"
              />
              <div class="slider-marks">
                <span>100ms</span>
                <span>500ms</span>
                <span>1s</span>
                <span>2s</span>
              </div>
            </div>
          </div>
          
          <!-- 隐藏时透明度 -->
          <div v-if="mouseHideEnabled" class="setting-group">
            <label class="setting-label">
              <span class="label-text">隐藏时透明度</span>
              <span class="label-value">{{ Math.round(hideOpacity * 100) }}%</span>
            </label>
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="0.5" 
                step="0.05" 
                v-model="hideOpacity"
                @input="updateHideOpacity"
                class="modern-slider opacity-slider"
              />
              <div class="slider-marks">
                <span>0%</span>
                <span>15%</span>
                <span>30%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </div>
        
                 <!-- 高级设置区域 -->
         <div class="setting-section">
           <h4 class="section-title">⚡ 体验优化</h4>
           
           <div class="setting-group">
             <label class="setting-label">
               <span class="label-text">极速模式</span>
               <div class="modern-toggle active">
                 <div class="toggle-thumb"></div>
                 <div class="toggle-bg"></div>
               </div>
             </label>
             <p class="setting-description">开启后获得更加流畅的浏览体验</p>
           </div>
           
           <div class="setting-group">
             <label class="setting-label">
               <span class="label-text">沉浸模式</span>
               <div class="modern-toggle">
                 <div class="toggle-thumb"></div>
                 <div class="toggle-bg"></div>
               </div>
             </label>
             <p class="setting-description">自动隐藏工具栏，享受纯净视野</p>
           </div>
         </div>
      </div>
      
      <!-- 设置底部 -->
      <div class="settings-footer">
        <button @click="testTheme" class="action-btn glass-button">
          <span class="btn-icon">🎨</span>
          预览主题
        </button>
        <button @click="testOpacity" class="action-btn glass-button">
          <span class="btn-icon">✨</span>
          预览效果
        </button>
        <button @click="resetSettings" class="action-btn glass-button secondary">
          <span class="btn-icon">🔄</span>
          恢复默认
        </button>
        <button @click="closeSettings" class="action-btn glass-button primary">
          <span class="btn-icon">💫</span>
          应用设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'update:opacity', 'update:mouseHide', 'update:hideDelay', 'update:hideOpacity', 'themeChange'])

// 设置状态
const opacity = ref(1.0)
const mouseHideEnabled = ref(false)
const hideDelay = ref(500)
const hideOpacity = ref(0.1)
const currentTheme = ref('ocean')
const uiStyle = ref('glass')

// 可用主题
const availableThemes = ref({
  ocean: {
    displayName: '海洋蓝',
    icon: '🌊',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  sunset: {
    displayName: '夕阳橙',
    icon: '🌅',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)'
  },
  forest: {
    displayName: '森林绿',
    icon: '🌲',
    gradient: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
  },
  purple: {
    displayName: '梦幻紫',
    icon: '💜',
    gradient: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
  },
  dark: {
    displayName: '深夜黑',
    icon: '🌙',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
  },
  cherry: {
    displayName: '樱花粉',
    icon: '🌸',
    gradient: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)'
  }
})

// 选择主题
const selectTheme = (themeName) => {
  console.log('🎨 SettingsPanel 选择主题:', themeName)
  currentTheme.value = themeName
  emit('themeChange', themeName)
  
  // 保存到本地存储
  localStorage.setItem('browser-theme', themeName)
  console.log('✅ SettingsPanel 主题选择完成:', themeName)
}

// 选择界面风格
const selectStyle = (style) => {
  uiStyle.value = style
  localStorage.setItem('browser-ui-style', style)
  
  // 这里可以添加切换界面风格的逻辑
}

// 更新透明度
const updateOpacity = () => {
  emit('update:opacity', parseFloat(opacity.value))
}

// 切换鼠标隐藏功能
const toggleMouseHide = () => {
  mouseHideEnabled.value = !mouseHideEnabled.value
  emit('update:mouseHide', mouseHideEnabled.value)
}

// 更新隐藏延迟
const updateHideDelay = () => {
  emit('update:hideDelay', parseInt(hideDelay.value))
}

// 更新隐藏时透明度
const updateHideOpacity = () => {
  emit('update:hideOpacity', parseFloat(hideOpacity.value))
}

// 关闭设置
const closeSettings = () => {
  emit('close')
}

// 测试主题功能
const testTheme = () => {
  const themes = ['sunset', 'forest', 'purple', 'cherry', 'dark', 'ocean']
  let index = 0
  
  const cycleTheme = () => {
    if (index < themes.length) {
      console.log('🎨 测试主题:', themes[index])
      selectTheme(themes[index])
      index++
      setTimeout(cycleTheme, 800)
    }
  }
  
  cycleTheme()
}

// 测试透明度功能
const testOpacity = () => {
  const originalOpacity = opacity.value
  
  opacity.value = 0.3
  updateOpacity()
  
  setTimeout(() => {
    opacity.value = 0.7
    updateOpacity()
  }, 500)
  
  setTimeout(() => {
    opacity.value = originalOpacity
    updateOpacity()
  }, 1000)
}

// 重置设置
const resetSettings = () => {
  opacity.value = 1.0
  mouseHideEnabled.value = false
  hideDelay.value = 500
  hideOpacity.value = 0.1
  currentTheme.value = 'ocean'
  uiStyle.value = 'glass'
  
  updateOpacity()
  emit('update:mouseHide', false)
  updateHideDelay()
  updateHideOpacity()
  selectTheme('ocean')
}

// 组件挂载时加载设置
onMounted(() => {
  const savedTheme = localStorage.getItem('browser-theme')
  const savedStyle = localStorage.getItem('browser-ui-style')
  
  if (savedTheme && availableThemes.value[savedTheme]) {
    selectTheme(savedTheme)
  }
  
  if (savedStyle) {
    uiStyle.value = savedStyle
  }
})

// 监听外部设置变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 面板打开时，加载当前设置
  }
})

// 暴露方法给父组件
defineExpose({
  setOpacity: (value) => { opacity.value = value },
  setMouseHideEnabled: (value) => { mouseHideEnabled.value = value },
  setHideDelay: (value) => { hideDelay.value = value },
  setHideOpacity: (value) => { hideOpacity.value = value },
  setTheme: (theme) => { selectTheme(theme) }
})
</script>

<style lang="scss" scoped>
@import '../styles/themes.scss';

.settings-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.settings-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  cursor: pointer;
}

.settings-content {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

// 设置头部
.settings-header {
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--glass-border);
  
  .header-icon {
    font-size: 1.5rem;
    margin-right: 1rem;
  }
  
  h3 {
    flex: 1;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--theme-text);
    margin: 0;
  }
  
  .close-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1.2rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
  }
}

// 设置主体
.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

// 设置区域
.setting-section {
  margin-bottom: 2rem;
  
  .section-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--theme-text);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

// 设置组
.setting-group {
  margin-bottom: 1.5rem;
  
  .setting-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    
    .label-text {
      font-size: 1rem;
      font-weight: 500;
      color: var(--theme-text);
    }
    
    .label-value {
      font-size: 0.9rem;
      color: var(--theme-accent);
      font-weight: 600;
    }
  }
  
  .setting-description {
    font-size: 0.85rem;
    color: var(--theme-text-secondary);
    margin-top: 0.5rem;
    line-height: 1.4;
  }
}

// 主题选择器
.theme-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  
  .theme-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    .theme-preview {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
      border: 3px solid transparent;
      transition: all 0.3s ease;
      
      .theme-name {
        font-size: 1.2rem;
      }
    }
    
    .theme-label {
      font-size: 0.8rem;
      color: var(--theme-text-secondary);
      text-align: center;
    }
    
    &.active .theme-preview {
      border-color: var(--theme-accent);
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }
    
    &:hover .theme-preview {
      transform: scale(1.05);
    }
  }
}

// 风格选择器
.style-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  .style-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    
    .style-preview {
      width: 100%;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      
      .preview-content {
        font-weight: 500;
        color: var(--theme-text);
      }
    }
    
    span {
      font-size: 0.9rem;
      color: var(--theme-text-secondary);
    }
    
    &.active .style-preview {
      border-color: var(--theme-accent);
      transform: scale(1.02);
    }
    
    &:hover .style-preview {
      transform: translateY(-2px);
    }
  }
}

// 现代化滑块
.slider-container {
  position: relative;
  margin: 0.5rem 0;
  
  .modern-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.2);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--theme-accent);
      cursor: pointer;
      border: 3px solid var(--theme-text);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.2);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }
    }
    
    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--theme-accent);
      cursor: pointer;
      border: 3px solid var(--theme-text);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  }
  
  .slider-marks {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    
    span {
      font-size: 0.7rem;
      color: var(--theme-text-secondary);
    }
  }
}

// 现代化开关
.modern-toggle {
  position: relative;
  width: 48px;
  height: 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  .toggle-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  
  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: var(--theme-text);
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  &.active {
    .toggle-bg {
      background: var(--theme-accent);
    }
    
    .toggle-thumb {
      transform: translateX(24px);
    }
  }
  
  &:hover .toggle-thumb {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
}

// 设置底部
.settings-footer {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--glass-border);
  
  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 10px 12px;
    font-size: 0.85rem;
    font-weight: 500;
    border-radius: 10px;
    transition: all 0.3s ease;
    
    .btn-icon {
      font-size: 0.9rem;
    }
    
    &.primary {
      background: var(--theme-accent);
      color: var(--theme-text);
      grid-column: span 2;
      
      &:hover {
        background: var(--theme-primary);
        transform: translateY(-2px);
      }
    }
    
    &.secondary {
      background: rgba(255, 255, 255, 0.1);
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
    
    &:not(.primary):not(.secondary) {
      background: rgba(255, 255, 255, 0.15);
      
      &:hover {
        background: rgba(255, 255, 255, 0.25);
      }
    }
  }
}

// 动画
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .settings-content {
    width: 95%;
    max-height: 90vh;
  }
  
  .settings-header,
  .settings-body,
  .settings-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .theme-selector {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .settings-footer {
    flex-direction: column;
  }
}
</style> 