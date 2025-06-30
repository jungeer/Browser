<template>
  <div v-if="visible" class="settings-panel">
    <div class="settings-overlay" @click="closeSettings"></div>
    <div class="settings-content">
      <div class="settings-header">
        <h3>浏览器设置</h3>
        <button @click="closeSettings" class="close-btn">×</button>
      </div>
      
      <div class="settings-body">
        <!-- 透明度设置 -->
        <div class="setting-group">
          <label class="setting-label">
            <span class="label-text">窗口透明度</span>
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
              class="opacity-slider"
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
            <span class="label-text">鼠标离开时隐藏</span>
            <div class="toggle-switch" :class="{ active: mouseHideEnabled }" @click="toggleMouseHide">
              <div class="toggle-thumb"></div>
            </div>
          </label>
          <p class="setting-description">启用后，鼠标离开窗口时浏览器会变得半透明</p>
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
              class="delay-slider"
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
              class="opacity-slider"
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
      
      <div class="settings-footer">
        <button @click="testOpacity" class="test-btn">测试透明度</button>
        <button @click="resetSettings" class="reset-btn">重置默认</button>
        <button @click="closeSettings" class="save-btn">保存设置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'update:opacity', 'update:mouseHide', 'update:hideDelay', 'update:hideOpacity'])

// 设置状态
const opacity = ref(1.0)
const mouseHideEnabled = ref(false)
const hideDelay = ref(500)
const hideOpacity = ref(0.1)

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

// 测试透明度功能
const testOpacity = () => {
  // 快速测试透明度变化
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
  
  updateOpacity()
  emit('update:mouseHide', false)
  updateHideDelay()
  updateHideOpacity()
}

// 监听外部设置变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 面板打开时，加载当前设置
    // 这里可以从 localStorage 或其他地方加载设置
  }
})

// 暴露方法给父组件
defineExpose({
  setOpacity: (value) => { opacity.value = value },
  setMouseHideEnabled: (value) => { mouseHideEnabled.value = value },
  setHideDelay: (value) => { hideDelay.value = value },
  setHideOpacity: (value) => { hideOpacity.value = value }
})
</script>

<style lang="scss" scoped>
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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.settings-content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e9e9e9;
  background: #f8f9fa;
  
  h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background: #e9e9e9;
      color: #333;
    }
  }
}

.settings-body {
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.setting-group {
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.setting-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  .label-text {
    font-weight: 500;
    color: #333;
    font-size: 1rem;
  }
  
  .label-value {
    font-weight: 600;
    color: #007acc;
    font-size: 0.9rem;
  }
}

.setting-description {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.slider-container {
  position: relative;
  
  input[type="range"] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e9e9e9;
    outline: none;
    -webkit-appearance: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #007acc;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
      
      &:hover {
        transform: scale(1.1);
        background: #005a9e;
      }
    }
    
    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #007acc;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
  
  .slider-marks {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    
    span {
      font-size: 0.75rem;
      color: #999;
    }
  }
}

.toggle-switch {
  width: 50px;
  height: 26px;
  background: #ccc;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  .toggle-thumb {
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &.active {
    background: #007acc;
    
    .toggle-thumb {
      transform: translateX(24px);
    }
  }
}

.settings-footer {
  display: flex;
  gap: 0.8rem;
  padding: 1.5rem;
  border-top: 1px solid #e9e9e9;
  background: #f8f9fa;
  
  button {
    flex: 1;
    padding: 0.75rem 1.2rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &.test-btn {
      background: #28a745;
      color: white;
      border-color: #28a745;
      
      &:hover {
        background: #218838;
        border-color: #1e7e34;
      }
    }
    
    &.reset-btn {
      background: white;
      color: #666;
      
      &:hover {
        background: #f0f0f0;
        border-color: #ccc;
      }
    }
    
    &.save-btn {
      background: #007acc;
      color: white;
      border-color: #007acc;
      
      &:hover {
        background: #005a9e;
        border-color: #005a9e;
      }
    }
  }
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

// 滚动条样式
.settings-body::-webkit-scrollbar {
  width: 6px;
}

.settings-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.settings-body::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.settings-body::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style> 