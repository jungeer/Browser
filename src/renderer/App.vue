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
      <webview
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :ref="`webview-${tab.id}`"
        :src="tab.url"
        :style="{ 
          display: activeTabIndex === index ? 'block' : 'none',
          width: '100%',
          height: '100%'
        }"
        class="webview"
        @dom-ready="onWebviewReady"
        @page-title-updated="onTitleUpdated"
        @did-navigate="onNavigate"
        @did-navigate-in-page="onNavigateInPage"
        allowpopups
        disablewebsecurity
        autosize="on"
        nodeintegration="false"
        webpreferences="contextIsolation=true"
      ></webview>
    </div>
    
    <!-- 状态栏 -->
    <div class="status-bar">
      <span class="status-text">{{ statusText }}</span>
      <span class="app-info">Vue Electron Browser v{{ appVersion }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'

// 响应式数据
const currentUrl = ref('https://www.google.com')
const tabs = reactive([
  {
    id: Date.now(),
    url: 'https://www.google.com',
    title: 'Google'
  }
])
const activeTabIndex = ref(0)
const canGoBack = ref(false)
const canGoForward = ref(false)
const statusText = ref('就绪')
const appVersion = ref('1.0.0')
const addressInput = ref(null)

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
        statusText.value = '正在加载...'
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
        statusText.value = '正在刷新...'
      }
    }

    // 添加新标签页
    const addTab = () => {
      const newTab = {
        id: Date.now(),
        url: 'https://www.google.com',
        title: '新标签页'
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
      })
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
  
  // 更新导航按钮状态和 webview 尺寸
  nextTick(() => {
    updateNavigationState()
    
    // 确保切换后的 webview 尺寸正确
    const currentWebview = getCurrentWebview()
    if (currentWebview) {
      // 强制重新设置尺寸
      currentWebview.style.width = '100%'
      currentWebview.style.height = '100%'
      currentWebview.style.display = 'block'
      
      // 稍微延迟一下，确保 DOM 更新完成
      setTimeout(() => {
        if (currentWebview.style.display !== 'none') {
          currentWebview.style.width = '100%'
          currentWebview.style.height = '100%'
        }
      }, 50)
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

    // Webview 事件处理
const onWebviewReady = (event) => {
  statusText.value = '页面加载完成'
  updateNavigationState()
  
  // 确保 webview 高度正确填充
  const webview = event.target
  if (webview) {
    // 强制设置 webview 的尺寸
    webview.style.width = '100%'
    webview.style.height = '100%'
    webview.style.display = 'block'
    
    // 尝试注入样式到 webview 内部（如果可能的话）
    try {
      webview.executeJavaScript(`
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'auto';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
      `).catch(err => {
        console.log('无法注入样式到 webview:', err)
      })
    } catch (err) {
      console.log('executeJavaScript 不可用:', err)
    }
  }
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

    // Electron API 事件监听
    const setupElectronListeners = () => {
      if (window.electronAPI) {
        // 监听菜单事件
        window.electronAPI.onNewTab(() => addTab())
        window.electronAPI.onCloseTab(() => closeTab(activeTabIndex.value))
        window.electronAPI.onGoBack(() => goBack())
        window.electronAPI.onGoForward(() => goForward())
        window.electronAPI.onReload(() => reload())
        
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
      }
    }

    // 处理窗口大小变化
const handleResize = () => {
  // 强制重新计算 webview 尺寸
  const currentWebview = getCurrentWebview()
  if (currentWebview) {
    // 短暂延迟后重新设置尺寸，确保布局完成
    setTimeout(() => {
      currentWebview.style.width = '100%'
      currentWebview.style.height = '100%'
    }, 100)
  }
}

// 生命周期钩子
onMounted(() => {
  setupElectronListeners()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 初始化时也调用一次
  setTimeout(handleResize, 500)
})

onUnmounted(() => {
  cleanupElectronListeners()
  window.removeEventListener('resize', handleResize)
})
</script> 