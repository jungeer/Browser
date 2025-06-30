<template>
  <div class="home-page">
    <div class="home-container">
      <div class="logo-section">
        <div class="logo">🌐</div>
        <h1 class="title">Vue Electron Browser</h1>
        <p class="subtitle">轻量级桌面浏览器</p>
      </div>
      
      <div class="search-section">
        <div class="search-box">
          <input 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            placeholder="搜索或输入网址..."
            class="search-input"
            ref="searchInput"
          />
          <button @click="handleSearch" class="search-btn">
            <span class="search-icon">🔍</span>
          </button>
        </div>
      </div>
      
      <div class="quick-links">
        <h3>快速访问</h3>
        <div class="links-grid">
          <a @click="navigateTo('https://www.baidu.com')" class="quick-link">
            <div class="link-icon">🅱️</div>
            <span>百度</span>
          </a>
          <a @click="navigateTo('https://www.google.com')" class="quick-link">
            <div class="link-icon">🅖</div>
            <span>Google</span>
          </a>
          <a @click="navigateTo('https://www.github.com')" class="quick-link">
            <div class="link-icon">📦</div>
            <span>GitHub</span>
          </a>
          <a @click="navigateTo('https://www.zhihu.com')" class="quick-link">
            <div class="link-icon">🎯</div>
            <span>知乎</span>
          </a>
          <a @click="navigateTo('https://www.bilibili.com')" class="quick-link">
            <div class="link-icon">📺</div>
            <span>哔哩哔哩</span>
          </a>
          <a @click="navigateTo('https://www.weibo.com')" class="quick-link">
            <div class="link-icon">🐦</div>
            <span>微博</span>
          </a>
        </div>
      </div>
      
      <div class="footer">
        <p>© 2024 Vue Electron Browser - 专注于简洁的浏览体验</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const searchQuery = ref('')
const searchInput = ref(null)

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
      url = `https://www.baidu.com/s?wd=${encodeURIComponent(url)}`
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
.home-page {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.home-container {
  text-align: center;
  max-width: 600px;
  width: 90%;
  padding: 2rem;
}

.logo-section {
  margin-bottom: 3rem;
  
  .logo {
    font-size: 4rem;
    margin-bottom: 1rem;
    display: inline-block;
    animation: float 3s ease-in-out infinite;
  }
  
  .title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    font-weight: 300;
  }
}

.search-section {
  margin-bottom: 3rem;
  
  .search-box {
    display: flex;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 25px;
    padding: 4px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 12px 20px;
      font-size: 1rem;
      color: white;
      outline: none;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.7);
      }
    }
    
    .search-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 20px;
      padding: 10px 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      .search-icon {
        font-size: 1.1rem;
      }
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
      }
    }
  }
}

.quick-links {
  margin-bottom: 2rem;
  
  h3 {
    margin-bottom: 1.5rem;
    font-size: 1.3rem;
    font-weight: 600;
    opacity: 0.9;
  }
  
  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 1rem;
    max-width: 480px;
    margin: 0 auto;
  }
  
  .quick-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    text-decoration: none;
    color: white;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    
    .link-icon {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }
    
    span {
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }
}

.footer {
  margin-top: 2rem;
  
  p {
    font-size: 0.9rem;
    opacity: 0.7;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

// 响应式设计
@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
  }
  
  .logo-section {
    .title {
      font-size: 2rem;
    }
  }
  
  .links-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
  }
}
</style> 