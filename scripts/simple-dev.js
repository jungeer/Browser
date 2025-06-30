#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 启动开发环境...');

// 启动 Vite 开发服务器
console.log('📦 启动 Vite...');
const viteProcess = spawn('npm', ['run', 'dev:vue'], {
  stdio: 'inherit',
  shell: true,
  detached: false
});

// 等待 3 秒后启动 Electron
setTimeout(() => {
  console.log('🖥️  启动 Electron...');
  const electronProcess = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  // 处理 Electron 退出
  electronProcess.on('close', () => {
    console.log('📱 Electron 已关闭，停止 Vite...');
    viteProcess.kill();
    process.exit(0);
  });

  // 处理中断信号
  process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭...');
    electronProcess.kill();
    viteProcess.kill();
    process.exit(0);
  });

}, 3000);

// 处理 Vite 退出
viteProcess.on('close', () => {
  console.log('🛑 Vite 已停止');
  process.exit(0);
}); 