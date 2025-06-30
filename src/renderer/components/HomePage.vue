<template>
  <div class="home-page">
    <div class="home-container">
      <!-- 主Logo区域 -->
      <div class="logo-section">
        <div class="logo float-animation">⭐</div>
        <h1 class="title">星辰浏览器</h1>
        <p class="subtitle">探索无限可能的智能浏览体验</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="search-box glass-surface">
          <div class="search-icon">🔍</div>
          <input 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            placeholder="搜索或输入网址..."
            class="search-input"
            ref="searchInput"
          />
          <button @click="handleSearch" class="search-btn glass-button">
            搜索
          </button>
        </div>
      </div>
      
      <!-- 快速访问区域 -->
      <div class="quick-links">
        <h3 class="section-title">精选网站</h3>
        <div class="links-grid">
          <div 
            v-for="link in quickLinks" 
            :key="link.name"
            @click="navigateTo(link.url)" 
            class="quick-link glass-card"
          >
            <div class="link-icon">{{ link.icon }}</div>
            <span class="link-name">{{ link.name }}</span>
            <div class="link-hover-effect"></div>
          </div>
        </div>
      </div>
      
      <!-- 功能卡片区域 -->
      <div class="feature-cards">
        <div class="feature-card glass-card">
          <div class="feature-icon">⚡</div>
          <h4>闪电般快速</h4>
          <p>毫秒级响应，让等待成为过去</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">🎨</div>
          <h4>颜值即正义</h4>
          <p>六款精美主题，总有一款适合你</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">🔒</div>
          <h4>隐私守护者</h4>
          <p>你的数据，只属于你自己</p>
        </div>
      </div>
      
      <!-- 底部信息 -->
      <div class="footer">
        <div class="footer-content glass-surface">
          <p>© 2024 星辰浏览器 - 让每一次浏览都成为探索</p>
          <div class="footer-links">
            <span @click="navigateTo('https://www.microsoft.com')" class="footer-link">微软</span>
            <span>•</span>
            <span @click="navigateTo('https://www.apple.com')" class="footer-link">苹果</span>
            <span>•</span>
            <span @click="navigateTo('https://www.google.com')" class="footer-link">谷歌</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 背景装饰 -->
    <div class="background-decorations">
      <div class="decoration decoration-1"></div>
      <div class="decoration decoration-2"></div>
      <div class="decoration decoration-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const searchQuery = ref('')
const searchInput = ref(null)

// 快速链接数据
const quickLinks = ref([
  { name: '百度', url: 'https://www.baidu.com', icon: '🅱️' },
  { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
  { name: 'GitHub', url: 'https://www.github.com', icon: '📦' },
  { name: '知乎', url: 'https://www.zhihu.com', icon: '🎯' },
  { name: '哔哩哔哩', url: 'https://www.bilibili.com', icon: '📺' },
  { name: '微博', url: 'https://www.weibo.com', icon: '🐦' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '📹' },
  { name: 'Twitter', url: 'https://www.twitter.com', icon: '🐦' }
])

// 定义 emits
const emit = defineEmits(['navigate'])

// 处理搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  
  let url = searchQuery.value.trim()
  
  // 如果不是完整的 URL，则添加协议或作为搜索
  if (!url.match(/^https?:\/\//)) {
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url
    } else {
      // 作为搜索处理
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`
    }
  }
  
  emit('navigate', url)
  searchQuery.value = ''
}

// 导航到指定 URL
const navigateTo = (url) => {
  emit('navigate', url)
}

// 组件挂载时聚焦搜索框
onMounted(() => {
  if (searchInput.value) {
    searchInput.value.focus()
  }
})
</script>

<style lang="scss" scoped>
@import '../styles/themes.scss';

.home-page {
  width: 100%;
  height: 100%;
  background: var(--theme-background);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow-y: auto;
  padding: 2rem 0;
}

.home-container {
  text-align: center;
  max-width: 1000px;
  width: 90%;
  padding: 2rem;
  position: relative;
  z-index: 10;
}

// Logo 区域
.logo-section {
  margin-bottom: 4rem;
  
  .logo {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    display: inline-block;
    filter: drop-shadow(0 4px 20px rgba(255, 255, 255, 0.3));
  }
  
  .title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.8rem;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, var(--theme-text), var(--theme-accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    font-weight: 300;
    color: var(--theme-text-secondary);
  }
}

// 搜索区域
.search-section {
  margin-bottom: 4rem;
  
  .search-box {
    display: flex;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
    padding: 8px;
    border-radius: 50px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.15),
        0 0 30px rgba(255, 255, 255, 0.1);
    }
    
    .search-icon {
      font-size: 1.2rem;
      margin: 0 15px;
      color: var(--theme-text-secondary);
    }
    
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 15px 10px;
      font-size: 1.1rem;
      color: var(--theme-text);
      outline: none;
      
      &::placeholder {
        color: var(--theme-text-secondary);
      }
    }
    
    .search-btn {
      margin-right: 8px;
      padding: 12px 24px;
      font-size: 0.9rem;
      border-radius: 25px;
    }
  }
}

// 快速访问区域
.quick-links {
  margin-bottom: 4rem;
  
  .section-title {
    margin-bottom: 2rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--theme-text);
    opacity: 0.9;
  }
  
  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .quick-link {
    position: relative;
    padding: 1.5rem 1rem;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    
    .link-icon {
      font-size: 2rem;
      margin-bottom: 0.8rem;
      display: block;
    }
    
    .link-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--theme-text);
    }
    
    .link-hover-effect {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, var(--theme-accent), var(--theme-primary));
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }
    
    &:hover {
      .link-hover-effect {
        opacity: 0.1;
      }
    }
  }
}

// 功能卡片区域
.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
  
  .feature-card {
    text-align: center;
    padding: 2rem 1.5rem;
    
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      display: block;
      opacity: 0.9;
    }
    
    h4 {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 0.8rem;
      color: var(--theme-text);
    }
    
    p {
      font-size: 0.95rem;
      color: var(--theme-text-secondary);
      line-height: 1.6;
    }
  }
}

// 底部区域
.footer {
  margin-top: 3rem;
  
  .footer-content {
    padding: 1.5rem 2rem;
    border-radius: 12px;
    
    p {
      font-size: 0.9rem;
      color: var(--theme-text-secondary);
      margin-bottom: 0.8rem;
    }
    
    .footer-links {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      font-size: 0.85rem;
      
      .footer-link {
        color: var(--theme-accent);
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          color: var(--theme-text);
          text-shadow: 0 0 10px var(--theme-accent);
        }
      }
      
      span:not(.footer-link) {
        color: var(--theme-text-secondary);
      }
    }
  }
}

// 背景装饰
.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  
  .decoration {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--theme-accent), var(--theme-primary));
    opacity: 0.1;
    animation: float 6s ease-in-out infinite;
  }
  
  .decoration-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    left: 5%;
    animation-delay: 0s;
  }
  
  .decoration-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 10%;
    animation-delay: 2s;
  }
  
  .decoration-3 {
    width: 100px;
    height: 100px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .home-container {
    width: 95%;
    padding: 1rem;
  }
  
  .logo-section {
    margin-bottom: 3rem;
    
    .logo {
      font-size: 4rem;
    }
    
    .title {
      font-size: 2.2rem;
    }
  }
  
  .links-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
  }
  
  .feature-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

// 滚动条样式
.home-page::-webkit-scrollbar {
  width: 8px;
}

.home-page::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.home-page::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
}
</style> 