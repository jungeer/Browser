<template>
  <div id="app">
    <!-- 浏览器工具栏 -->
    <div class="browser-toolbar">
      <div class="navigation-buttons">
        <button 
          @click="goBack" 
          :disabled="!canGoBack"
          class="nav-btn"
          title="后退"
        >
          ←
        </button>
        <button 
          @click="goForward" 
          :disabled="!canGoForward"
          class="nav-btn"
          title="前进"
        >
          →
        </button>
        <button 
          @click="reload" 
          class="nav-btn"
          title="刷新"
        >
          ↻
        </button>
      </div>
      
      <div class="address-bar">
        <input 
          ref="addressInput"
          v-model="currentUrl" 
          @keyup.enter="navigate"
          placeholder="输入网址或搜索..."
          class="url-input"
        />
        <button @click="navigate" class="go-btn">跳转</button>
      </div>
      
      <div class="tab-controls">
        <button @click="goHome" class="home-btn" title="回到首页">🏠</button>
        <button @click="openSettings" class="settings-btn" title="设置">⚙️</button>
        <button @click="addTab" class="tab-btn" title="新建标签页">+</button>
      </div>
    </div>
    
    <!-- 标签页 -->
    <div class="tabs-container">
      <div 
        v-for="(tab, index) in tabs" 
        :key="tab.id"
        :class="['tab', { active: activeTabIndex === index }]"
        @click="switchTab(index)"
      >
        <span class="tab-title">{{ tab.title || '新标签页' }}</span>
        <button 
          @click.stop="closeTab(index)" 
          class="close-tab-btn"
          v-if="tabs.length > 1"
        >
          ×
        </button>
      </div>
    </div>
    
    <!-- 网页内容区域 -->
    <div class="web-content">
      <!-- 首页组件 -->
      <template v-for="(tab, index) in tabs" :key="`home-${tab.id}`">
        <HomePage 
          v-if="tab.url === 'home://' && activeTabIndex === index"
          @navigate="handleHomeNavigate"
        />
      </template>
      
      <!-- WebView 组件 -->
      <template v-for="(tab, index) in tabs" :key="tab.id">
        <webview
          v-if="tab.url !== 'home://'"
          :ref="`webview-${tab.id}`"
          :src="tab.url"
          :style="{ 
            display: activeTabIndex === index ? 'flex' : 'none'
          }"
          class="webview"
          @dom-ready="onWebviewReady"
          @page-title-updated="onTitleUpdated"
          @did-navigate="onNavigate"
          @did-navigate-in-page="onNavigateInPage"
          @new-window="onNewWindow"
          @will-navigate="onWillNavigate"
          allowpopups="false"
          disablewebsecurity
          nodeintegration="false"
          webpreferences="contextIsolation=true,nativeWindowOpen=false"
        ></webview>
      </template>
    </div>
    
    <!-- 状态栏 -->
    <div class="status-bar">
      <span class="status-text">{{ statusText }}</span>
      <span class="app-info">星辰浏览器 v{{ appVersion }}</span>
    </div>
    
    <!-- 设置面板 -->
    <SettingsPanel 
      :visible="showSettings"
      @close="closeSettings"
      @update:opacity="updateWindowOpacity"
      @update:mouseHide="updateMouseHide"
      @update:hideDelay="updateHideDelay"
      @update:hideOpacity="updateHideOpacity"
      @themeChange="handleThemeChange"
      ref="settingsPanel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import HomePage from './components/HomePage.vue'
import SettingsPanel from './components/SettingsPanel.vue'

// 响应式数据
const currentUrl = ref('home://')
const tabs = reactive([
  {
    id: Date.now(),
    url: 'home://',
    title: '星辰首页'
  }
])
const activeTabIndex = ref(0)
const canGoBack = ref(false)
const canGoForward = ref(false)
const statusText = ref('星辰为您点亮')
const appVersion = ref('1.0.0')
const addressInput = ref(null)

// 设置相关状态
const showSettings = ref(false)
const settingsPanel = ref(null)
const windowOpacity = ref(1.0)
const mouseHideEnabled = ref(false)
const hideDelay = ref(500)
const hideOpacity = ref(0.1)
const isMouseInside = ref(true)
const hideTimeout = ref(null)

// 主题相关状态
const currentTheme = ref('ocean')

    // 获取当前活动标签页
    const getCurrentTab = () => tabs[activeTabIndex.value]
    
    // 获取当前 webview
    const getCurrentWebview = () => {
      const tab = getCurrentTab()
      if (tab) {
        const webviews = document.querySelectorAll('webview')
        return Array.from(webviews).find(wv => wv.style.display !== 'none')
      }
      return null
    }

    // 导航功能
    const navigate = () => {
      let url = currentUrl.value.trim()
      if (!url) return

      // 如果不是完整的 URL，则添加协议
      if (!url.match(/^https?:\/\//)) {
        if (url.includes('.') && !url.includes(' ')) {
          url = 'https://' + url
        } else {
          // 作为搜索处理
          url = `https://www.google.com/search?q=${encodeURIComponent(url)}`
        }
      }

      const currentTab = getCurrentTab()
      if (currentTab) {
        currentTab.url = url
        statusText.value = '星辰正在为您导航...'
      }
    }

    // 后退
    const goBack = () => {
      const webview = getCurrentWebview()
      if (webview && webview.canGoBack()) {
        webview.goBack()
      }
    }

    // 前进
    const goForward = () => {
      const webview = getCurrentWebview()
      if (webview && webview.canGoForward()) {
        webview.goForward()
      }
    }

    // 刷新
    const reload = () => {
      const webview = getCurrentWebview()
      if (webview) {
        webview.reload()
        statusText.value = '正在为您刷新页面...'
      }
    }

    // 添加新标签页
    const addTab = () => {
      const newTab = {
        id: Date.now(),
        url: 'home://',
        title: '新的探索'
      }
      tabs.push(newTab)
      activeTabIndex.value = tabs.length - 1
      currentUrl.value = newTab.url
      
      // 聚焦地址栏
      nextTick(() => {
        if (addressInput.value) {
          addressInput.value.focus()
          addressInput.value.select()
        }
        
        // 为新标签页的 webview 注入保护脚本（稍后触发）
        setTimeout(() => {
          const currentWebview = getCurrentWebview()
          if (currentWebview) {
            injectLinkInterceptionScript(currentWebview)
          }
        }, 1000)
      })
    }

    // 回到首页
    const goHome = () => {
      const currentTab = getCurrentTab()
      if (currentTab) {
        currentTab.url = 'home://'
        currentTab.title = '星辰首页'
        currentUrl.value = 'home://'
        statusText.value = '欢迎回到星辰首页'
      }
    }

    // 处理首页导航
    const handleHomeNavigate = (url) => {
      const currentTab = getCurrentTab()
      if (currentTab) {
        currentTab.url = url
        currentUrl.value = url
        statusText.value = '星辰正在为您打开链接...'
        
        // 延迟注入保护脚本
        setTimeout(() => {
          const currentWebview = getCurrentWebview()
          if (currentWebview) {
            injectLinkInterceptionScript(currentWebview)
          }
        }, 1000)
      }
    }

    // 关闭标签页
    const closeTab = (index) => {
      if (tabs.length <= 1) return
      
      tabs.splice(index, 1)
      
      // 调整活动标签页索引
      if (activeTabIndex.value >= index) {
        activeTabIndex.value = Math.max(0, activeTabIndex.value - 1)
      }
      
      // 更新地址栏
      const currentTab = getCurrentTab()
      if (currentTab) {
        currentUrl.value = currentTab.url
      }
    }

    // 切换标签页
const switchTab = (index) => {
  activeTabIndex.value = index
  const currentTab = getCurrentTab()
  if (currentTab) {
    currentUrl.value = currentTab.url
  }
  
  // 更新导航按钮状态，并重新注入保护脚本
  nextTick(() => {
    updateNavigationState()
    
    // 为切换后的 webview 重新注入保护脚本（以防脚本丢失）
    const currentWebview = getCurrentWebview()
    if (currentWebview) {
      injectLinkInterceptionScript(currentWebview)
    }
  })
}

    // 更新导航按钮状态
    const updateNavigationState = () => {
      const webview = getCurrentWebview()
      if (webview) {
        canGoBack.value = webview.canGoBack()
        canGoForward.value = webview.canGoForward()
      }
    }

    // 链接拦截脚本注入函数
    const injectLinkInterceptionScript = (webview) => {
      if (!webview) return
      
      try {
        // 注入脚本来拦截所有可能的新窗口打开方式
        webview.executeJavaScript(`
          (function() {
            // 检查是否已经注入过，避免重复注入
            if (window.__linkInterceptionInjected) {
              return;
            }
            window.__linkInterceptionInjected = true;
            
            // 1. 拦截 window.open
            const originalOpen = window.open;
            window.open = function(url, name, features) {
              console.log('🚫 拦截 window.open:', url);
              // 阻止新窗口打开，在当前页面导航
              if (url && url !== 'about:blank' && !url.startsWith('javascript:')) {
                window.location.href = url;
              }
              return null;
            };
            
            // 2. 拦截所有 target="_blank" 的链接
            document.addEventListener('click', function(e) {
              const link = e.target.closest('a');
              if (link && link.href) {
                const target = link.getAttribute('target');
                if (target === '_blank' || target === '_new') {
                  console.log('🚫 拦截 target="_blank" 链接:', link.href);
                  e.preventDefault();
                  e.stopPropagation();
                  // 在当前页面打开
                  if (!link.href.startsWith('javascript:')) {
                    window.location.href = link.href;
                  }
                  return false;
                }
              }
            }, true);
            
            // 3. 拦截动态创建的链接
            const originalCreateElement = document.createElement;
            document.createElement = function(tagName) {
              const element = originalCreateElement.call(this, tagName);
              if (tagName.toLowerCase() === 'a') {
                element.addEventListener('click', function(e) {
                  if (this.target === '_blank' || this.target === '_new') {
                    console.log('🚫 拦截动态链接:', this.href);
                    e.preventDefault();
                    if (this.href && !this.href.startsWith('javascript:')) {
                      window.location.href = this.href;
                    }
                  }
                });
              }
              return element;
            };
            
            // 4. 监听并拦截任何表单的 target="_blank"
            document.addEventListener('submit', function(e) {
              const form = e.target;
              if (form.target === '_blank' || form.target === '_new') {
                console.log('🚫 拦截表单 target="_blank"');
                form.target = '_self';
              }
            }, true);
            
            // 5. 全局拦截所有 window.open 的变体
            window.addEventListener('beforeunload', function(e) {
              // 这里可以添加额外的清理逻辑
            });
            
            console.log('🛡️ 链接拦截脚本已加载');
          })();
        `).catch(err => {
          console.log('无法注入链接拦截脚本:', err)
        })
      } catch (err) {
        console.log('executeJavaScript 不可用:', err)
      }
    }

    // Webview 事件处理
const onWebviewReady = (event) => {
        statusText.value = '页面已完美呈现'
  updateNavigationState()
  
  // 注入链接拦截脚本
  injectLinkInterceptionScript(event.target)
}

    const onTitleUpdated = (event) => {
      const currentTab = getCurrentTab()
      if (currentTab) {
        currentTab.title = event.title || '无标题'
      }
    }

    const onNavigate = (event) => {
      const currentTab = getCurrentTab()
      if (currentTab) {
        currentTab.url = event.url
        currentUrl.value = event.url
      }
      updateNavigationState()
    }

    const onNavigateInPage = (event) => {
      onNavigate(event)
    }

    // 处理导航前的事件（额外保护层）
    const onWillNavigate = (event) => {
      // 允许正常的页面导航，但记录日志
      console.log('🔗 即将导航到:', event.url)
    }

    // 处理新窗口请求（防止弹窗，在当前标签页打开）
    const onNewWindow = (event) => {
      console.log('🚫 拦截新窗口请求:', event.url)
      event.preventDefault()
      
      // 在当前标签页中打开新 URL
      const currentTab = getCurrentTab()
              if (currentTab && event.url) {
          // 检查 URL 是否有效
          if (event.url && event.url !== 'about:blank' && !event.url.startsWith('javascript:')) {
            currentTab.url = event.url
            currentUrl.value = event.url
            statusText.value = '星辰正在为您打开新页面...'
          }
        }
    }

    // Electron API 事件监听
    const setupElectronListeners = () => {
      if (window.electronAPI) {
        // 监听菜单事件
        window.electronAPI.onNewTab(() => addTab())
        window.electronAPI.onCloseTab(() => closeTab(activeTabIndex.value))
        window.electronAPI.onGoBack(() => goBack())
        window.electronAPI.onGoForward(() => goForward())
        window.electronAPI.onReload(() => reload())
        
        // 监听在当前标签页打开 URL 的事件
        window.electronAPI.onOpenUrlInCurrentTab((event, url) => {
          const currentTab = getCurrentTab()
          if (currentTab && url) {
            currentTab.url = url
            currentUrl.value = url
            statusText.value = '星辰正在响应您的请求...'
          }
        })
        
        // 获取应用版本
        window.electronAPI.getAppVersion().then(version => {
          appVersion.value = version
        }).catch(err => {
          console.log('获取应用版本失败:', err)
        })
      }
    }

    // 清理事件监听器
    const cleanupElectronListeners = () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('new-tab')
        window.electronAPI.removeAllListeners('close-tab')
        window.electronAPI.removeAllListeners('go-back')
        window.electronAPI.removeAllListeners('go-forward')
        window.electronAPI.removeAllListeners('reload')
        window.electronAPI.removeAllListeners('open-url-in-current-tab')
      }
    }

    // 处理窗口大小变化
const handleResize = () => {
  // 由于使用了 flexbox 布局，webview 会自动调整尺寸
  // 这里保留函数以备将来扩展需要
}

// 设置相关方法
const openSettings = () => {
  showSettings.value = true
  loadCurrentSettings()
}

const closeSettings = () => {
  showSettings.value = false
  saveSettings()
}

const updateWindowOpacity = async (opacity) => {
  windowOpacity.value = opacity
  if (window.electronAPI) {
    try {
      const result = await window.electronAPI.setWindowOpacity(opacity)
      if (result && !result.success) {
        console.error('❌ 透明度设置失败:', result.error)
        statusText.value = `透明效果调整遇到问题`
      } else {
        statusText.value = `透明效果已调至 ${Math.round(opacity * 100)}%`
      }
    } catch (err) {
      console.error('❌ 透明度设置异常:', err)
      statusText.value = '透明效果暂时无法调整'
    }
  } else {
    console.error('❌ electronAPI 不可用')
    statusText.value = '系统暂时无法响应'
  }
}

const updateMouseHide = (enabled) => {
  mouseHideEnabled.value = enabled
  
  if (enabled) {
    setupMouseListeners()
    statusText.value = '智能隐身模式已开启'
  } else {
    removeMouseListeners()
    // 恢复正常透明度
    if (window.electronAPI) {
      window.electronAPI.setWindowOpacity(windowOpacity.value)
      statusText.value = '智能隐身模式已关闭'
    }
  }
}

const updateHideDelay = (delay) => {
  hideDelay.value = delay
}

const updateHideOpacity = (opacity) => {
  hideOpacity.value = opacity
}

// 主题切换处理
const handleThemeChange = (themeName) => {
  console.log('🎨 切换主题:', themeName)
  currentTheme.value = themeName
  
  // 更新根元素的主题类
  const root = document.documentElement
  const body = document.body
  
  // 移除旧的主题类
  root.className = root.className.replace(/theme-\w+/g, '')
  body.className = body.className.replace(/theme-\w+/g, '')
  
  // 添加新的主题类
  root.classList.add(`theme-${themeName}`)
  body.classList.add(`theme-${themeName}`)
  
  // 保存到本地存储
  localStorage.setItem('browser-theme', themeName)
  statusText.value = `已切换到${getThemeDisplayName(themeName)}主题`
  
  console.log('✅ 主题切换完成:', {
    themeName,
    rootClasses: root.className,
    bodyClasses: body.className
  })
}

// 获取主题显示名称
const getThemeDisplayName = (themeName) => {
  const themeNames = {
    ocean: '海洋蓝',
    sunset: '夕阳橙',
    forest: '森林绿',
    purple: '梦幻紫',
    dark: '深夜黑',
    cherry: '樱花粉'
  }
  return themeNames[themeName] || '经典'
}

// 应用主题
const applyTheme = (themeName = 'ocean') => {
  console.log('🎨 应用主题:', themeName)
  currentTheme.value = themeName
  
  // 更新根元素的主题类
  const root = document.documentElement
  const body = document.body
  
  // 移除旧的主题类
  root.className = root.className.replace(/theme-\w+/g, '')
  body.className = body.className.replace(/theme-\w+/g, '')
  
  // 添加新的主题类
  root.classList.add(`theme-${themeName}`)
  body.classList.add(`theme-${themeName}`)
  
  console.log('✅ 主题应用完成:', {
    themeName,
    rootClasses: root.className,
    bodyClasses: body.className
  })
}

// 鼠标事件处理
const handleMouseEnter = () => {
  isMouseInside.value = true
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
    hideTimeout.value = null
  }
  
  if (mouseHideEnabled.value && window.electronAPI) {
    window.electronAPI.setWindowOpacity(windowOpacity.value)
    statusText.value = '星辰为您重新点亮'
  }
}

const handleMouseLeave = () => {
  isMouseInside.value = false
  if (mouseHideEnabled.value) {
    hideTimeout.value = setTimeout(() => {
      if (!isMouseInside.value && window.electronAPI) {
        window.electronAPI.setWindowOpacity(hideOpacity.value)
        statusText.value = '星辰进入隐身模式'
      }
    }, hideDelay.value)
  }
}

// 使用更可靠的鼠标事件监听
const setupMouseListeners = () => {
  const appElement = document.getElementById('app')
  if (appElement) {
    // 使用 mouseover/mouseout 代替 mouseenter/mouseleave
    appElement.addEventListener('mouseover', handleMouseEnter, { passive: true })
    appElement.addEventListener('mouseout', handleMouseLeave, { passive: true })
    
    // 额外监听窗口焦点事件作为备用
    window.addEventListener('focus', handleMouseEnter, { passive: true })
    window.addEventListener('blur', () => {
      // 给一个短延迟，避免快速切换时的误触发
      setTimeout(handleMouseLeave, 100)
    }, { passive: true })
  } else {
    console.error('❌ 找不到 #app 元素')
  }
}

const removeMouseListeners = () => {
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.removeEventListener('mouseover', handleMouseEnter)
    appElement.removeEventListener('mouseout', handleMouseLeave)
  }
  
  window.removeEventListener('focus', handleMouseEnter)
  window.removeEventListener('blur', handleMouseLeave)
  
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
    hideTimeout.value = null
  }
}

// 设置持久化
const saveSettings = () => {
  try {
    const settings = {
      windowOpacity: windowOpacity.value,
      mouseHideEnabled: mouseHideEnabled.value,
      hideDelay: hideDelay.value,
      hideOpacity: hideOpacity.value,
      currentTheme: currentTheme.value
    }
    localStorage.setItem('browserSettings', JSON.stringify(settings))
    statusText.value = '个性化设置已保存'
  } catch (err) {
    console.error('❌ 保存设置失败:', err)
    statusText.value = '设置保存遇到问题'
  }
}

const loadSettings = async () => {
  try {
    const saved = localStorage.getItem('browserSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      windowOpacity.value = settings.windowOpacity || 1.0
      mouseHideEnabled.value = settings.mouseHideEnabled || false
      hideDelay.value = settings.hideDelay || 500
      hideOpacity.value = settings.hideOpacity || 0.1
      
      // 应用主题设置
      const savedTheme = settings.currentTheme || localStorage.getItem('browser-theme') || 'ocean'
      applyTheme(savedTheme)
      
      // 应用透明度设置
      if (window.electronAPI) {
        await window.electronAPI.setWindowOpacity(windowOpacity.value)
      }
      
      // 应用鼠标隐藏设置
      if (mouseHideEnabled.value) {
        setupMouseListeners()
      }
      
      statusText.value = '个性化设置已应用'
    } else {
      // 使用默认设置，但仍然检查是否有单独保存的主题
      const savedTheme = localStorage.getItem('browser-theme') || 'ocean'
      applyTheme(savedTheme)
      statusText.value = '已为您设置默认风格'
    }
  } catch (err) {
    console.error('❌ 加载设置失败:', err)
    statusText.value = '设置恢复遇到问题'
    // 即使加载失败，也应用默认主题
    applyTheme('ocean')
  }
}

const loadCurrentSettings = () => {
  if (settingsPanel.value) {
    settingsPanel.value.setOpacity(windowOpacity.value)
    settingsPanel.value.setMouseHideEnabled(mouseHideEnabled.value)
    settingsPanel.value.setHideDelay(hideDelay.value)
    settingsPanel.value.setHideOpacity(hideOpacity.value)
    settingsPanel.value.setTheme(currentTheme.value)
  }
}

// 生命周期钩子
onMounted(async () => {
  // 首先应用主题，避免闪烁
  const savedTheme = localStorage.getItem('browser-theme') || 'ocean'
  applyTheme(savedTheme)
  
  setupElectronListeners()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 等待 electronAPI 可用后再加载设置
  if (window.electronAPI) {
    // 加载保存的设置
    await loadSettings()
  } else {
    // 如果 electronAPI 还没准备好，稍后重试
    setTimeout(async () => {
      if (window.electronAPI) {
        await loadSettings()
      } else {
        console.error('❌ electronAPI 仍然不可用')
        statusText.value = '系统正在初始化，请稍候'
      }
    }, 1000)
  }
  
  // 初始化时也调用一次
  setTimeout(handleResize, 500)
})

onUnmounted(() => {
  cleanupElectronListeners()
  window.removeEventListener('resize', handleResize)
  removeMouseListeners()
  saveSettings()
})
</script> 