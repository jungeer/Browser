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
        
        // 为新标签页的 webview 注入保护脚本（稍后触发）
        setTimeout(() => {
          const currentWebview = getCurrentWebview()
          if (currentWebview) {
            injectLinkInterceptionScript(currentWebview)
          }
        }, 1000)
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
  statusText.value = '页面加载完成'
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
          statusText.value = '正在加载...'
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
            statusText.value = '正在加载...'
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