#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 启动 Vue Electron Browser 开发环境...\n');

// 设置环境变量
process.env.NODE_ENV = 'development';

// 启动 Vite 开发服务器
console.log('📦 启动 Vite 开发服务器...');
const viteProcess = spawn('npm', ['run', 'dev:vue'], {
  stdio: 'inherit',
  shell: true,
  detached: false
});

// 处理 Vite 启动错误
viteProcess.on('error', (err) => {
  console.error('❌ Vite 启动失败:', err.message);
  process.exit(1);
});

// 等待 3 秒后启动 Electron
setTimeout(() => {
  console.log('🖥️  启动 Electron 客户端...');
  const electronProcess = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  // 处理 Electron 启动错误
  electronProcess.on('error', (err) => {
    console.error('❌ Electron 启动失败:', err.message);
    viteProcess.kill();
    process.exit(1);
  });

  // 处理 Electron 退出
  electronProcess.on('close', (code) => {
    console.log('\n📱 Electron 已关闭，正在停止 Vite 服务器...');
    viteProcess.kill();
    console.log('✅ 开发服务器已停止');
    process.exit(0);
  });

  // 处理中断信号（Ctrl+C）
  process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭开发环境...');
    electronProcess.kill();
    viteProcess.kill();
    console.log('✅ 开发环境已关闭');
    process.exit(0);
  });

  // 处理终止信号
  process.on('SIGTERM', () => {
    console.log('\n🛑 收到终止信号，正在关闭...');
    electronProcess.kill();
    viteProcess.kill();
    process.exit(0);
  });

}, 3000);

// 处理 Vite 退出
viteProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Vite 进程异常退出，退出码: ${code}`);
  } else {
    console.log('🛑 Vite 服务器已停止');
  }
  process.exit(code || 0);
}); 