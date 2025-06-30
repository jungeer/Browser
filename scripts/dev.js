#!/usr/bin/env node

const { spawn } = require('child_process')
const http = require('http')

console.log('🚀 启动 Vue Electron Browser 开发环境...\n')

// 设置环境变量
process.env.NODE_ENV = 'development'

// 检测可用端口
function findAvailablePort(startPort = 5173, maxPort = 5180) {
  return new Promise((resolve, reject) => {
    let currentPort = startPort
    
    function check(port) {
      const req = http.request({
        hostname: '127.0.0.1',
        port: port,
        path: '/',
        method: 'HEAD'
      }, (res) => {
        // 如果能连接说明端口被占用，检查下一个
        if (port >= maxPort) {
          reject(new Error('没有找到可用端口'))
        } else {
          check(port + 1)
        }
      })
      
      req.on('error', () => {
        // 连接失败说明端口可用
        resolve(port)
      })
      
      req.end()
    }
    
    check(currentPort)
  })
}

// 检查服务器是否可用
function checkServer(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    function check() {
      const req = http.request({
        hostname: '127.0.0.1',
        port: port,
        path: '/',
        method: 'HEAD'
      }, (res) => {
        if (res.statusCode === 200) {
          console.log(`✅ Vite 服务器已就绪 (端口 ${port})`)
          resolve(port)
        } else {
          setTimeout(check, 1000)
        }
      })
      
      req.on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error('服务器启动超时'))
        } else {
          setTimeout(check, 1000)
        }
      })
      
      req.end()
    }
    
    check()
  })
}

async function startDev() {
  console.log('📦 启动 Vite 开发服务器...')
  
  // 启动 Vite
  const viteProcess = spawn('npm', ['run', 'dev:vue'], {
    stdio: 'pipe',
    shell: true
  })
  
  let vitePort = null
  
  // 监听 Vite 输出以获取端口信息
  viteProcess.stdout.on('data', (data) => {
    const output = data.toString()
    console.log(output)
    
    // 提取端口信息
    const portMatch = output.match(/Local:\s+http:\/\/127\.0\.0\.1:(\d+)/)
    if (portMatch && !vitePort) {
      vitePort = parseInt(portMatch[1])
      console.log(`📡 检测到 Vite 端口: ${vitePort}`)
    }
  })
  
  viteProcess.stderr.on('data', (data) => {
    console.error(data.toString())
  })
  
  try {
    // 等待检测到端口
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('未能检测到 Vite 端口'))
      }, 10000)
      
      const checkPort = setInterval(() => {
        if (vitePort) {
          clearTimeout(timeout)
          clearInterval(checkPort)
          resolve()
        }
      }, 100)
    })
    
    // 等待服务器就绪
    await checkServer(vitePort)
    
    console.log('🖥️  启动 Electron...')
    
    // 更新 main.js 中的 URL
    const fs = require('fs')
    const path = require('path')
    const mainPath = path.join(__dirname, '../src/main/main.js')
    let mainContent = fs.readFileSync(mainPath, 'utf8')
    mainContent = mainContent.replace(/http:\/\/127\.0\.0\.1:\d+/, `http://127.0.0.1:${vitePort}`)
    fs.writeFileSync(mainPath, mainContent)
    
    // 启动 Electron
    const electronProcess = spawn('npx', ['electron', '.'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    })
    
    // 处理进程退出
    electronProcess.on('close', (code) => {
      console.log(`�� Electron 已关闭 (退出码: ${code})`)
      viteProcess.kill()
      process.exit(0)
    })
    
    viteProcess.on('close', (code) => {
      console.log(`🛑 Vite 服务器已停止 (退出码: ${code})`)
      electronProcess.kill()
      process.exit(0)
    })
    
    // 处理中断信号
    process.on('SIGINT', () => {
      console.log('\n🛑 正在关闭开发服务器...')
      viteProcess.kill()
      electronProcess.kill()
      process.exit(0)
    })
    
  } catch (error) {
    console.error('❌ 启动失败:', error.message)
    viteProcess.kill()
    process.exit(1)
  }
}

startDev() 