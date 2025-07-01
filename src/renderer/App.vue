<template>
  <div id="app" :class="`theme-${currentTheme}`">
    <!-- 顶部标题栏 - Chrome风格 -->
    <div class="chrome-title-bar">
      <!-- 标签页容器（占据大部分空间） -->
      <div class="tabs-container">
        <div 
          v-for="(tab, index) in tabs" 
          :key="tab.id"
          :class="['tab', { active: activeTabIndex === index }]"
          @click="switchTab(index)"
        >
          <img 
            v-if="tab.favicon" 
            :src="tab.favicon" 
            class="tab-favicon"
            @error="onFaviconError(tab)"
          />
          <Globe v-else :size="14" class="tab-icon" />
          <span class="tab-title">{{ tab.title || '新标签页' }}</span>
          <button 
            @click.stop="closeTab(index)" 
            class="close-tab-btn"
            v-if="tabs.length > 1"
          >
            <X :size="12" />
          </button>
        </div>
        
        <!-- 新建标签按钮 -->
        <button @click="addTab" class="new-tab-btn" title="新建标签页">
          <Plus :size="14" />
        </button>
      </div>
      
      <!-- 窗口控制按钮区域（紧凑设计） -->
      <div class="window-controls">
        <button @click="goHome" class="control-btn home-btn" title="回到首页">
          <Home :size="14" />
        </button>
        <button @click="openSettings" class="control-btn settings-btn" title="设置">
          <Settings :size="14" />
        </button>
      </div>
    </div>

    <!-- 浏览器工具栏（集成到一行） - 极简模式下缩小 -->
    <div class="browser-toolbar" :class="{ 'minimalist': minimalistMode }">
      <div class="navigation-buttons">
        <button 
          @click="goBack" 
          :disabled="!canGoBack"
          class="nav-btn"
          title="后退"
        >
          <ArrowLeft :size="18" />
        </button>
        <button 
          @click="goForward" 
          :disabled="!canGoForward"
          class="nav-btn"
          title="前进"
        >
          <ArrowRight :size="18" />
        </button>
        <button 
          @click="reload" 
          class="nav-btn"
          title="刷新"
        >
          <RotateCcw :size="18" />
        </button>
      </div>
      
      <div class="address-bar">
        <div class="url-container">
          <Shield 
            v-if="isSecure" 
            :size="16" 
            class="security-icon secure" 
          />
          <AlertTriangle 
            v-else-if="!isLocal" 
            :size="16" 
            class="security-icon insecure" 
          />
          <input 
            ref="addressInput"
            v-model="currentUrl" 
            @keyup.enter="navigate"
            @focus="onAddressFocus"
            @blur="onAddressBlur"
            placeholder="搜索或输入网址"
            class="url-input"
          />
        </div>
        <button @click="navigate" class="go-btn">
          <Search v-if="!isValidUrl(currentUrl)" :size="16" />
          <ArrowRight v-else :size="16" />
        </button>
      </div>
      
      <div class="toolbar-actions">
        <button @click="toggleBookmark" class="action-btn bookmark-btn" title="收藏">
          <Star :size="18" :fill="isBookmarked ? 'currentColor' : 'none'" />
        </button>
        <button @click="showMenu" class="action-btn menu-btn" title="菜单">
          <MoreVertical :size="18" />
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
          @page-favicon-updated="onFaviconUpdated"
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
    
    <!-- 状态栏 - 极简模式下隐藏 -->
    <div v-if="!minimalistMode" class="status-bar">
      <div class="status-left">
        <Wifi :size="14" v-if="isOnline" class="status-icon" />
        <WifiOff :size="14" v-else class="status-icon offline" />
        <span class="status-text">{{ statusText }}</span>
      </div>
      <div class="status-right">
        <Clock :size="14" class="status-icon" />
        <span class="app-info">鸡米花浏览器 v{{ appVersion }}</span>
      </div>
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
      @update:customColors="updateCustomColors"
      @update:minimalistMode="updateMinimalistMode"
      @update:alwaysOnTop="updateAlwaysOnTop"
      ref="settingsPanel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Settings, 
  Plus, 
  X, 
  Globe, 
  Search, 
  Shield, 
  AlertTriangle, 
  Star, 
  MoreVertical,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-vue-next'
import HomePage from './components/HomePage.vue'
import SettingsPanel from './components/SettingsPanel.vue'

// 响应式数据
const currentUrl = ref('home://')
const tabs = reactive([
  {
    id: Date.now(),
    url: 'home://',
    title: '鸡米花首页',
    favicon: null
  }
])
const activeTabIndex = ref(0)
const canGoBack = ref(false)
const canGoForward = ref(false)
const statusText = ref('鸡米花为您点亮')
const appVersion = ref('1.0.0')
const addressInput = ref(null)
const isOnline = ref(true)
const isBookmarked = ref(false)

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
const currentTheme = ref('dark')
const customThemeColors = ref({
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#4facfe'
})

// 新功能状态
const minimalistMode = ref(false)  // 极简模式
const alwaysOnTop = ref(false)    // 系统置顶

// 计算属性
const isSecure = computed(() => {
  const url = getCurrentTab()?.url || ''
  return url.startsWith('https://') || url === 'home://'
})

const isLocal = computed(() => {
  const url = getCurrentTab()?.url || ''
  return url === 'home://' || url.startsWith('file://')
})

const isValidUrl = (url) => {
  if (!url || !url.trim()) return false
  const trimmed = url.trim()
  return trimmed.includes('.') && !trimmed.includes(' ') && !trimmed.match(/\s/)
}

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

// 获取网站favicon
const getFavicon = (url) => {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    // 使用Google的favicon服务
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch (e) {
    return null
  }
}

// Favicon更新处理
const onFaviconUpdated = (event) => {
  const tab = getCurrentTab()
  if (tab && event.favicons && event.favicons.length > 0) {
    tab.favicon = event.favicons[0]
  } else if (tab && tab.url !== 'home://') {
    // 如果没有favicon，尝试使用Google服务获取
    tab.favicon = getFavicon(tab.url)
  }
}

// Favicon错误处理
const onFaviconError = (tab) => {
  tab.favicon = null
}

// 地址栏焦点处理
const onAddressFocus = () => {
  if (addressInput.value) {
    addressInput.value.select()
  }
}

const onAddressBlur = () => {
  // 失去焦点时显示当前页面URL
  const tab = getCurrentTab()
  if (tab && tab.url !== 'home://') {
    currentUrl.value = tab.url
  }
}

// 导航功能
const navigate = () => {
  let url = currentUrl.value.trim()
  if (!url) return

  console.log('🚀 开始导航:', url)

  let finalUrl = url
  let isSearch = false

  // 如果不是完整的 URL，则添加协议或作为搜索处理
  if (!url.match(/^https?:\/\//)) {
    if (url.includes('.') && !url.includes(' ') && !url.match(/\s/)) {
      // 看起来像域名，添加https协议
      finalUrl = 'https://' + url
      console.log('🌐 识别为网址，添加协议:', finalUrl)
    } else {
      // 作为搜索处理
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`
      isSearch = true
      console.log('🔍 识别为搜索词，使用Google搜索:', finalUrl)
    }
  }

  const currentTab = getCurrentTab()
  if (currentTab) {
    // 更新标签页URL
    currentTab.url = finalUrl
    currentUrl.value = finalUrl
    statusText.value = isSearch ? '鸡米花正在为您搜索...' : '鸡米花正在为您导航...'
    
    // 强制webview导航到新URL
    nextTick(() => {
      const webview = getCurrentWebview()
      if (webview) {
        console.log('📱 使用现有webview导航到:', finalUrl)
        webview.loadURL(finalUrl)
      } else {
        console.log('🆕 将创建新webview加载:', finalUrl)
      }
    })
    
    console.log('✅ 导航完成:', finalUrl)
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
    title: '新的探索',
    favicon: null
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
    currentTab.title = '鸡米花首页'
    currentTab.favicon = null  // 重置图标为默认状态
    currentUrl.value = 'home://'
    statusText.value = '欢迎回到鸡米花首页'
  }
}

// 处理首页导航
const handleHomeNavigate = (url) => {
  const currentTab = getCurrentTab()
  if (currentTab) {
    currentTab.url = url
    currentUrl.value = url
    statusText.value = '鸡米花正在为您打开链接...'
    
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
      statusText.value = '鸡米花正在为您打开新页面...'
      
      // 强制webview导航到新URL
      nextTick(() => {
        const webview = getCurrentWebview()
        if (webview) {
          webview.loadURL(event.url)
        }
      })
    }
  }
}

// 开发者工具控制
const toggleDevTools = async () => {
  const currentTab = getCurrentTab()
  if (currentTab) {
    // 如果是首页，切换主窗口的开发者工具
    if (currentTab.url === 'home://') {
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.toggleMainDevTools()
          if (result.success) {
            statusText.value = result.message || '首页开发者工具已切换'
          } else {
            statusText.value = '首页开发者工具切换失败: ' + (result.error || '未知错误')
          }
        } catch (err) {
          console.error('❌ 主窗口开发者工具操作失败:', err)
          statusText.value = '首页开发者工具操作异常'
        }
      } else {
        statusText.value = '开发者工具功能暂不可用'
      }
    } else {
      // 如果是网页，切换webview的开发者工具
      const webview = getCurrentWebview()
      if (webview) {
        try {
          if (webview.isDevToolsOpened && webview.isDevToolsOpened()) {
            webview.closeDevTools()
            statusText.value = '网页开发者工具已关闭'
          } else {
            webview.openDevTools()
            statusText.value = '网页开发者工具已打开'
          }
        } catch (err) {
          console.error('❌ 网页开发者工具操作失败:', err)
          statusText.value = '网页开发者工具操作失败'
        }
      } else {
        statusText.value = '当前页面开发者工具不可用'
      }
    }
  } else {
    statusText.value = '无法获取当前页面信息'
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
    window.electronAPI.onToggleDevTools(() => toggleDevTools())
    
    // 监听在当前标签页打开 URL 的事件
    window.electronAPI.onOpenUrlInCurrentTab((event, url) => {
      const currentTab = getCurrentTab()
      if (currentTab && url) {
        currentTab.url = url
        currentUrl.value = url
        statusText.value = '鸡米花正在响应您的请求...'
        
        // 强制webview导航到新URL
        nextTick(() => {
          const webview = getCurrentWebview()
          if (webview) {
            webview.loadURL(url)
          }
        })
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
    window.electronAPI.removeAllListeners('toggle-dev-tools')
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
  // 延迟加载设置，确保组件完全渲染
  nextTick(() => {
    loadCurrentSettings()
  })
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
  
  // 清除自定义颜色状态
  localStorage.removeItem('browser-using-custom-colors')
  const customStyleSheet = document.getElementById('custom-colors-override')
  if (customStyleSheet) {
    customStyleSheet.remove()
  }
  
  // 更新根元素的主题类
  const root = document.documentElement
  const body = document.body
  
  // 移除旧的主题类（包括自定义主题类）
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
    cherry: '樱花粉',
    programmer: '程序员',
    accountant: '会计师'
  }
  return themeNames[themeName] || '经典'
}

// 应用主题
const applyTheme = (themeName = 'dark') => {
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
    statusText.value = '鸡米花为您重新点亮'
  }
}

const handleMouseLeave = () => {
  isMouseInside.value = false
  if (mouseHideEnabled.value) {
    hideTimeout.value = setTimeout(() => {
      if (!isMouseInside.value && window.electronAPI) {
        window.electronAPI.setWindowOpacity(hideOpacity.value)
        statusText.value = '鸡米花进入隐身模式'
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
      currentTheme: currentTheme.value,
      customThemeColors: customThemeColors.value,
      minimalistMode: minimalistMode.value,
      alwaysOnTop: alwaysOnTop.value
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
      
      // 加载新功能设置
      if (settings.customThemeColors) {
        customThemeColors.value = settings.customThemeColors
        // 检查是否正在使用自定义颜色
        const usingCustomColors = localStorage.getItem('browser-using-custom-colors')
        if (usingCustomColors === 'true') {
          // 应用自定义颜色，但不保存（避免循环调用）
          const colors = settings.customThemeColors
          
          let customStyleSheet = document.getElementById('custom-colors-override')
          if (!customStyleSheet) {
            customStyleSheet = document.createElement('style')
            customStyleSheet.id = 'custom-colors-override'
            document.head.appendChild(customStyleSheet)
          }
          
          customStyleSheet.textContent = `
            :root,
            body,
            #app,
            .theme-ocean,
            .theme-sunset,
            .theme-forest,
            .theme-purple,
            .theme-dark,
            .theme-cherry,
            .theme-programmer,
            .theme-accountant {
              --theme-primary: ${colors.primary} !important;
              --theme-secondary: ${colors.secondary} !important;
              --theme-accent: ${colors.accent} !important;
              --theme-surface: ${colors.primary}26 !important;
              --theme-background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
            }
          `
          
          console.log('✅ 启动时加载自定义颜色:', settings.customThemeColors)
        }
      } else {
        // 如果统一设置中没有，尝试从单独的键加载
        const savedCustomColors = localStorage.getItem('browser-custom-colors')
        const usingCustomColors = localStorage.getItem('browser-using-custom-colors')
        const themeMode = localStorage.getItem('browser-theme-mode') || 'preset'
        if (savedCustomColors && usingCustomColors === 'true' && themeMode === 'custom') {
          try {
            const colors = JSON.parse(savedCustomColors)
            customThemeColors.value = colors
            
            let customStyleSheet = document.getElementById('custom-colors-override')
            if (!customStyleSheet) {
              customStyleSheet = document.createElement('style')
              customStyleSheet.id = 'custom-colors-override'
              document.head.appendChild(customStyleSheet)
            }
            
            customStyleSheet.textContent = `
              :root,
              body,
              #app,
              .theme-ocean,
              .theme-sunset,
              .theme-forest,
              .theme-purple,
              .theme-dark,
              .theme-cherry,
              .theme-programmer,
              .theme-accountant {
                --theme-primary: ${colors.primary} !important;
                --theme-secondary: ${colors.secondary} !important;
                --theme-accent: ${colors.accent} !important;
                --theme-surface: ${colors.primary}26 !important;
                --theme-background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
              }
            `
            
            console.log('✅ 从单独键加载自定义颜色:', colors)
          } catch (err) {
            console.error('❌ 解析自定义颜色失败:', err)
          }
        }
      }
      if (settings.minimalistMode !== undefined) {
        minimalistMode.value = settings.minimalistMode
      }
      if (settings.alwaysOnTop !== undefined) {
        alwaysOnTop.value = settings.alwaysOnTop
        if (window.electronAPI) {
          await window.electronAPI.setAlwaysOnTop(alwaysOnTop.value)
        }
      }
      
      // 应用主题设置
      const savedTheme = settings.currentTheme || localStorage.getItem('browser-theme') || 'dark'
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
      const savedTheme = localStorage.getItem('browser-theme') || 'dark'
      applyTheme(savedTheme)
      statusText.value = '已为您设置默认风格'
    }
  } catch (err) {
    console.error('❌ 加载设置失败:', err)
    statusText.value = '设置恢复遇到问题'
    // 即使加载失败，也应用默认主题
    applyTheme('dark')
  }
}

const loadCurrentSettings = () => {
  if (settingsPanel.value) {
    settingsPanel.value.setOpacity(windowOpacity.value)
    settingsPanel.value.setMouseHideEnabled(mouseHideEnabled.value)
    settingsPanel.value.setHideDelay(hideDelay.value)
    settingsPanel.value.setHideOpacity(hideOpacity.value)
    settingsPanel.value.setTheme(currentTheme.value)
    settingsPanel.value.setCustomColors(customThemeColors.value)
    settingsPanel.value.setMinimalistMode(minimalistMode.value)
    settingsPanel.value.setAlwaysOnTop(alwaysOnTop.value)
    
    // 同步主题模式
    const savedThemeMode = localStorage.getItem('browser-theme-mode') || 'preset'
    settingsPanel.value.setThemeMode(savedThemeMode)
  }
}

// 新功能处理方法
// 更新自定义主题颜色
const updateCustomColors = (colors) => {
  customThemeColors.value = { ...colors }
  
  // 检查是否正在使用自定义模式
  const themeMode = localStorage.getItem('browser-theme-mode') || 'preset'
  if (themeMode !== 'custom') {
    console.log('⚠️ 当前不是自定义模式，跳过颜色应用')
    return
  }
  
  // 创建高优先级的样式表
  let customStyleSheet = document.getElementById('custom-colors-override')
  if (!customStyleSheet) {
    customStyleSheet = document.createElement('style')
    customStyleSheet.id = 'custom-colors-override'
    document.head.appendChild(customStyleSheet)
  }
  
  customStyleSheet.textContent = `
    :root,
    body,
    #app,
    .theme-ocean,
    .theme-sunset,
    .theme-forest,
    .theme-purple,
    .theme-dark,
    .theme-cherry,
    .theme-programmer,
    .theme-accountant {
      --theme-primary: ${colors.primary} !important;
      --theme-secondary: ${colors.secondary} !important;
      --theme-accent: ${colors.accent} !important;
      --theme-surface: ${colors.primary}26 !important;
      --theme-background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
    }
  `
  
  // 保存到本地存储
  localStorage.setItem('browser-custom-colors', JSON.stringify(colors))
  localStorage.setItem('browser-using-custom-colors', 'true')
  saveSettings()
  statusText.value = '自定义主题颜色已应用'
  console.log('✅ 自定义颜色已应用:', colors)
}

// 更新极简模式
const updateMinimalistMode = (enabled) => {
  minimalistMode.value = enabled
  // 保存到本地存储
  localStorage.setItem('browser-minimalist-mode', JSON.stringify(enabled))
  statusText.value = enabled ? '极简模式已开启' : '极简模式已关闭'
}

// 更新系统置顶
const updateAlwaysOnTop = async (enabled) => {
  alwaysOnTop.value = enabled
  
  // 通过IPC设置窗口置顶
  if (window.electronAPI) {
    try {
      const result = await window.electronAPI.setAlwaysOnTop(enabled)
      if (result.success) {
        statusText.value = enabled ? '窗口已置顶' : '窗口置顶已取消'
      } else {
        statusText.value = '置顶设置失败: ' + (result.error || '未知错误')
      }
    } catch (error) {
      console.error('❌ 设置窗口置顶失败:', error)
      statusText.value = '置顶功能异常'
    }
  }
  
  // 保存到本地存储
  localStorage.setItem('browser-always-on-top', JSON.stringify(enabled))
}

// 书签功能
const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
  statusText.value = isBookmarked.value ? '已添加到收藏' : '已取消收藏'
}

// 显示菜单
const showMenu = () => {
  statusText.value = '功能菜单即将推出'
}

// 网络状态检测
const checkOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

// 键盘事件处理
const handleKeyDown = (event) => {
  // F12 开发者工具
  if (event.key === 'F12') {
    event.preventDefault()
    toggleDevTools()
  }
  // Ctrl/Cmd + Shift + I 也可以打开开发者工具（备选快捷键）
  else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I') {
    event.preventDefault()
    toggleDevTools()
  }
}

// 生命周期钩子
onMounted(async () => {
  // 首先应用主题，避免闪烁
  const savedTheme = localStorage.getItem('browser-theme') || 'dark'
  applyTheme(savedTheme)
  
  setupElectronListeners()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 监听键盘事件
  window.addEventListener('keydown', handleKeyDown)
  
  // 监听网络状态
  window.addEventListener('online', checkOnlineStatus)
  window.addEventListener('offline', checkOnlineStatus)
  checkOnlineStatus()
  
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
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('online', checkOnlineStatus)
  window.removeEventListener('offline', checkOnlineStatus)
  removeMouseListeners()
  saveSettings()
})
</script> 