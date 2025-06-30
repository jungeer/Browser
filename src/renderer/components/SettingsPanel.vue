<template>
  <Transition name="settings" appear>
    <div v-if="visible" class="settings-panel">
      <div class="settings-overlay" @click="closeSettings"></div>
      <div class="settings-content glass-surface">
        <!-- 设置头部 -->
        <div class="settings-header">
          <div class="header-content">
            <Sparkles :size="24" class="header-icon" />
            <h3>个性化设置</h3>
          </div>
          <button @click="closeSettings" class="close-btn">
            <X :size="18" />
          </button>
        </div>
        
        <div class="settings-body">
          <!-- 主题设置区域 -->
          <div class="setting-section">
            <h4 class="section-title">
              <Palette :size="20" class="section-icon" />
              视觉风格
            </h4>
           
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
                    <component :is="theme.iconComponent" :size="16" class="theme-icon" />
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
                    <Layers :size="20" />
                    <span>透明质感</span>
                  </div>
                </div>
                <div 
                  :class="['style-option', { active: uiStyle === 'neu' }]"
                  @click="selectStyle('neu')"
                >
                  <div class="style-preview neu-surface">
                    <Box :size="20" />
                    <span>立体质感</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 窗口设置区域 -->
          <div class="setting-section">
            <h4 class="section-title">
              <Monitor :size="20" class="section-icon" />
              窗口效果
            </h4>
            
            <!-- 透明度设置 -->
            <div class="setting-group">
              <label class="setting-label">
                <span class="label-text">
                  <Eye :size="16" class="label-icon" />
                  透明效果
                </span>
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
                <span class="label-text">
                  <MousePointer :size="16" class="label-icon" />
                  智能隐身
                </span>
                <div class="modern-toggle" :class="{ active: mouseHideEnabled }" @click="toggleMouseHide">
                  <div class="toggle-thumb"></div>
                  <div class="toggle-bg"></div>
                </div>
              </label>
              <p class="setting-description">鼠标离开时自动隐身，专注不受打扰</p>
            </div>
           
            <!-- 隐藏延迟设置 -->
            <div v-if="mouseHideEnabled" class="setting-group sub-setting">
              <label class="setting-label">
                <span class="label-text">
                  <Timer :size="16" class="label-icon" />
                  隐藏延迟
                </span>
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
            <div v-if="mouseHideEnabled" class="setting-group sub-setting">
              <label class="setting-label">
                <span class="label-text">
                  <EyeOff :size="16" class="label-icon" />
                  隐藏时透明度
                </span>
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
            <h4 class="section-title">
              <Zap :size="20" class="section-icon" />
              体验优化
            </h4>
            
            <div class="setting-group">
              <label class="setting-label">
                <span class="label-text">
                  <Rocket :size="16" class="label-icon" />
                  极速模式
                </span>
                <div class="modern-toggle active">
                  <div class="toggle-thumb"></div>
                  <div class="toggle-bg"></div>
                </div>
              </label>
              <p class="setting-description">开启后获得更加流畅的浏览体验</p>
            </div>
            
            <div class="setting-group">
              <label class="setting-label">
                <span class="label-text">
                  <Maximize :size="16" class="label-icon" />
                  沉浸模式
                </span>
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
          <button @click="testTheme" class="action-btn">
            <Shuffle :size="16" class="btn-icon" />
            <span>预览主题</span>
          </button>
          <button @click="testOpacity" class="action-btn">
            <Sparkles :size="16" class="btn-icon" />
            <span>预览效果</span>
          </button>
          <button @click="resetSettings" class="action-btn secondary">
            <RotateCcw :size="16" class="btn-icon" />
            <span>恢复默认</span>
          </button>
          <button @click="closeSettings" class="action-btn primary">
            <Check :size="16" class="btn-icon" />
            <span>应用设置</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { 
  Sparkles,
  X,
  Palette,
  Monitor,
  Eye,
  EyeOff,
  MousePointer,
  Timer,
  Zap,
  Rocket,
  Maximize,
  Shuffle,
  RotateCcw,
  Check,
  Layers,
  Box,
  Waves,
  Sunset,
  Trees,
  Heart,
  Moon,
  Cherry
} from 'lucide-vue-next'

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
    iconComponent: Waves,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  sunset: {
    displayName: '夕阳橙',
    iconComponent: Sunset,
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)'
  },
  forest: {
    displayName: '森林绿',
    iconComponent: Trees,
    gradient: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
  },
  purple: {
    displayName: '梦幻紫',
    iconComponent: Heart,
    gradient: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
  },
  dark: {
    displayName: '深夜黑',
    iconComponent: Moon,
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
  },
  cherry: {
    displayName: '樱花粉',
    iconComponent: Cherry,
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
    currentTheme.value = savedTheme
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
  setTheme: (theme) => { currentTheme.value = theme }
})
</script>

<style lang="scss" scoped>
/* 设置面板容器 */
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
}

.settings-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
}

.settings-content {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 设置头部 */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  color: var(--theme-accent);
}

.settings-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--theme-text);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--theme-text);
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.6);
  color: white;
  transform: scale(1.1);
}

/* 设置主体 */
.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

.settings-body::-webkit-scrollbar {
  width: 6px;
}

.settings-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.settings-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.settings-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 设置区域 */
.setting-section {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--theme-text);
  margin-bottom: 1.25rem;
}

.section-icon {
  color: var(--theme-accent);
}

/* 设置组 */
.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group.sub-setting {
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
}

.setting-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.label-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--theme-text);
}

.label-icon {
  color: var(--theme-text-secondary);
}

.label-value {
  font-size: 0.9rem;
  color: var(--theme-accent);
  font-weight: 600;
}

.setting-description {
  font-size: 0.85rem;
  color: var(--theme-text-secondary);
  margin-top: 0.5rem;
  line-height: 1.4;
}

/* 主题选择器 */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-preview {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  border: 3px solid transparent;
  transition: all 0.3s ease;
  color: white;
}

.theme-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.theme-label {
  font-size: 0.8rem;
  color: var(--theme-text-secondary);
  text-align: center;
  font-weight: 500;
}

.theme-option.active .theme-preview {
  border-color: var(--theme-accent);
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.theme-option:hover .theme-preview {
  transform: scale(1.05);
}

/* 风格选择器 */
.style-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.style-option {
  cursor: pointer;
  transition: all 0.3s ease;
}

.style-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  color: var(--theme-text);
}

.style-preview span {
  font-size: 0.85rem;
  font-weight: 500;
}

.glass-surface {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.neu-surface {
  background: #e0e5ec;
  box-shadow: 
    inset 5px 5px 10px #a3b1c6,
    inset -5px -5px 10px #ffffff;
  color: #333;
}

.style-option.active .style-preview {
  border-color: var(--theme-accent);
  transform: scale(1.02);
}

.style-option:hover .style-preview {
  transform: translateY(-2px);
}

/* 现代化滑块 */
.slider-container {
  position: relative;
  margin: 0.5rem 0;
}

.modern-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.modern-slider::-webkit-slider-thumb {
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
}

.modern-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.modern-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--theme-accent);
  cursor: pointer;
  border: 3px solid var(--theme-text);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.slider-marks span {
  font-size: 0.7rem;
  color: var(--theme-text-secondary);
}

/* 现代化开关 */
.modern-toggle {
  position: relative;
  width: 48px;
  height: 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

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

.modern-toggle.active .toggle-bg {
  background: var(--theme-accent);
}

.modern-toggle.active .toggle-thumb {
  transform: translateX(24px);
}

.modern-toggle:hover .toggle-thumb {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* 设置底部 */
.settings-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.15);
  color: var(--theme-text);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.action-btn.primary {
  background: var(--theme-accent);
  color: white;
  grid-column: span 2;
  font-weight: 600;
}

.action-btn.primary:hover {
  background: var(--theme-primary);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-icon {
  flex-shrink: 0;
}

/* 过渡动画 */
.settings-enter-active,
.settings-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-enter-active .settings-content,
.settings-leave-active .settings-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-enter-from,
.settings-leave-to {
  opacity: 0;
}

.settings-enter-from .settings-content,
.settings-leave-to .settings-content {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.settings-enter-to,
.settings-leave-from {
  opacity: 1;
}

.settings-enter-to .settings-content,
.settings-leave-from .settings-content {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* 响应式设计 */
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
    gap: 0.75rem;
  }
  
  .theme-preview {
    width: 40px;
    height: 40px;
  }
  
  .settings-footer {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }
  
  .action-btn.primary {
    grid-column: span 1;
  }
}

@media (max-width: 480px) {
  .settings-header h3 {
    font-size: 1.25rem;
  }
  
  .theme-selector {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 