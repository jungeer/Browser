<template>
  <div class="home-page">
    <div class="home-container">
      <!-- 主Logo区域 -->
      <div class="logo-section">
        <div class="logo float-animation">
          <Star :size="48" :fill="'currentColor'" />
        </div>
        <h1 class="title">星辰浏览器</h1>
        <p class="subtitle">探索无限可能的智能浏览体验</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="search-box glass-surface">
          <Search :size="20" class="search-icon" />
          <input 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            placeholder="搜索或输入网址..."
            class="search-input"
            ref="searchInput"
          />
          <button @click="handleSearch" class="search-btn glass-button">
            <ArrowRight :size="16" v-if="isValidUrl(searchQuery)" />
            <Search :size="16" v-else />
            <span>{{ isValidUrl(searchQuery) ? '跳转' : '搜索' }}</span>
          </button>
        </div>
      </div>
      
      <!-- 快速访问区域 -->
      <div class="quick-links">
        <h3 class="section-title">
          <Bookmark :size="20" class="section-icon" />
          精选网站
        </h3>
        <div class="links-grid">
          <div 
            v-for="(link, index) in quickLinks" 
            :key="link.name"
            @click="navigateTo(link.url)" 
            class="quick-link glass-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div 
              class="link-icon-container"
              :style="{ 
                background: link.bgColor,
                animationDelay: `${index * 0.2}s`
              }"
            >
              <img 
                v-if="link.favicon" 
                :src="link.favicon" 
                :alt="link.name"
                class="link-favicon"
                @error="onFaviconError(link)"
              />
              <component 
                v-else-if="link.iconComponent" 
                :is="link.iconComponent" 
                :size="24" 
                class="link-icon" 
              />
              <Globe v-else :size="24" class="link-icon" />
            </div>
            <span class="link-name">{{ link.name }}</span>
            <div class="link-hover-effect" :style="{ background: link.bgColor }"></div>
          </div>
        </div>
      </div>
      
      <!-- 功能卡片区域 -->
      <div class="feature-cards">
        <div class="feature-card glass-card">
          <div class="feature-icon">
            <Zap :size="32" />
          </div>
          <h4>闪电般快速</h4>
          <p>毫秒级响应，让等待成为过去</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">
            <Palette :size="32" />
          </div>
          <h4>颜值即正义</h4>
          <p>六款精美主题，总有一款适合你</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">
            <Shield :size="32" />
          </div>
          <h4>隐私守护者</h4>
          <p>你的数据，只属于你自己</p>
        </div>
      </div>
      
      <!-- 底部信息 -->
      <div class="footer">
        <div class="footer-content glass-surface">
          <p>
            <Heart :size="16" class="footer-icon" />
            © 2024 星辰浏览器 - 让每一次浏览都成为探索
          </p>
          <div class="footer-links">
            <span @click="navigateTo('https://www.microsoft.com')" class="footer-link">
              <ExternalLink :size="14" />
              微软
            </span>
            <span>•</span>
            <span @click="navigateTo('https://www.apple.com')" class="footer-link">
              <ExternalLink :size="14" />
              苹果
            </span>
            <span>•</span>
            <span @click="navigateTo('https://www.google.com')" class="footer-link">
              <ExternalLink :size="14" />
              谷歌
            </span>
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
import { 
  Star,
  Search,
  ArrowRight,
  Bookmark,
  Globe,
  Zap,
  Palette,
  Shield,
  Heart,
  ExternalLink,
  Github
} from 'lucide-vue-next'

const searchQuery = ref('')
const searchInput = ref(null)

// 获取网站favicon
const getFavicon = (domain) => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

// 检查是否为有效URL
const isValidUrl = (url) => {
  if (!url || !url.trim()) return false
  const trimmed = url.trim()
  return trimmed.includes('.') && !trimmed.includes(' ') && !trimmed.match(/\s/)
}

// 快速链接数据 - 使用官方favicon
const quickLinks = ref([
  { 
    name: '百度', 
    url: 'https://www.baidu.com', 
    favicon: getFavicon('baidu.com'),
    iconComponent: null,
    color: '#2932E1',
    bgColor: 'linear-gradient(135deg, #2932E1, #2E5BFF)'
  },
  { 
    name: 'Google', 
    url: 'https://www.google.com', 
    favicon: getFavicon('google.com'),
    iconComponent: null,
    color: '#4285F4',
    bgColor: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)'
  },
  { 
    name: 'GitHub', 
    url: 'https://www.github.com', 
    favicon: getFavicon('github.com'),
    iconComponent: Github,
    color: '#24292f',
    bgColor: 'linear-gradient(135deg, #24292f, #57606a)'
  },
  { 
    name: '知乎', 
    url: 'https://www.zhihu.com', 
    favicon: getFavicon('zhihu.com'),
    iconComponent: null,
    color: '#0084FF',
    bgColor: 'linear-gradient(135deg, #0084FF, #00A1FF)'
  },
  { 
    name: '哔哩哔哩', 
    url: 'https://www.bilibili.com', 
    favicon: getFavicon('bilibili.com'),
    iconComponent: null,
    color: '#FB7299',
    bgColor: 'linear-gradient(135deg, #FB7299, #FF8DC7)'
  },
  { 
    name: '微博', 
    url: 'https://www.weibo.com', 
    favicon: getFavicon('weibo.com'),
    iconComponent: null,
    color: '#E6162D',
    bgColor: 'linear-gradient(135deg, #E6162D, #FF4757)'
  },
  { 
    name: 'YouTube', 
    url: 'https://www.youtube.com', 
    favicon: getFavicon('youtube.com'),
    iconComponent: null,
    color: '#FF0000',
    bgColor: 'linear-gradient(135deg, #FF0000, #FF4444)'
  },
  { 
    name: 'Twitter', 
    url: 'https://www.twitter.com', 
    favicon: getFavicon('x.com'),
    iconComponent: null,
    color: '#000000',
    bgColor: 'linear-gradient(135deg, #000000, #333333)'
  }
])

// Favicon加载失败处理
const onFaviconError = (link) => {
  link.favicon = null
}

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
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--theme-background);
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.home-container {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  z-index: 2;
}

/* Logo区域 */
.logo-section {
  text-align: center;
  padding: 1rem 0;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  margin-bottom: 1rem;
  color: var(--theme-accent);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--theme-text);
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.1rem;
  color: var(--theme-text-secondary);
  margin: 0;
  font-weight: 400;
}

/* 搜索区域 */
.search-section {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.search-box {
  display: flex;
  align-items: center;
  max-width: 600px;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 50px;
  gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box:focus-within {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.search-icon {
  color: var(--theme-text-secondary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--theme-text);
  outline: none;
  font-weight: 400;
}

.search-input::placeholder {
  color: var(--theme-text-secondary);
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 25px;
  border: none;
  background: var(--theme-accent);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-btn:hover {
  background: var(--theme-primary);
  transform: scale(1.05);
}

/* 快速链接区域 */
.quick-links {
  text-align: center;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text);
  margin-bottom: 1.5rem;
}

.section-icon {
  color: var(--theme-accent);
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.quick-link {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quick-link:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.link-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: floatIcon 3s ease-in-out infinite;
}

@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.link-favicon,
.link-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: white;
}

.link-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--theme-text);
  text-align: center;
  position: relative;
  z-index: 1;
}

.link-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  border-radius: 16px;
  transition: opacity 0.3s ease;
}

.quick-link:hover .link-hover-effect {
  opacity: 0.1;
}

/* 功能卡片区域 */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.feature-card {
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  margin: 0 auto 1rem;
  color: var(--theme-accent);
}

.feature-card h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text);
  margin: 0 0 0.5rem 0;
}

.feature-card p {
  font-size: 0.95rem;
  color: var(--theme-text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* 底部区域 */
.footer {
  margin-top: 2rem;
  padding-top: 1rem;
}

.footer-content {
  text-align: center;
  padding: 1.5rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.footer-content p {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--theme-text-secondary);
  margin: 0 0 1rem 0;
}

.footer-icon {
  color: var(--theme-accent);
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--theme-accent);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.footer-link:hover {
  color: var(--theme-primary);
  transform: translateY(-1px);
}

/* 背景装饰 */
.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.decoration {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--theme-surface) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.decoration-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.decoration-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: -5%;
  animation-delay: 2s;
}

.decoration-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 10%;
  animation-delay: 4s;
}

/* 浮动动画 */
.float-animation {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .links-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
  
  .quick-link {
    padding: 1rem 0.5rem;
  }
  
  .link-icon-container {
    width: 40px;
    height: 40px;
  }
  
  .link-favicon,
  .link-icon {
    width: 20px;
    height: 20px;
  }
  
  .link-name {
    font-size: 0.8rem;
  }
  
  .feature-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .search-box {
    padding: 0.6rem 0.8rem;
  }
  
  .search-btn span {
    display: none;
  }
}

@media (max-width: 480px) {
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style> 