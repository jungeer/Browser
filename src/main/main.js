const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron')
const path = require('path')

// 保持对窗口对象的全局引用，避免垃圾回收时窗口被关闭
let mainWindow

/**
 * 创建主窗口
 */
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    transparent: false, // 设为 false，使用 setOpacity 方法控制透明度
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      webviewTag: true // 启用 webview 标签支持
    },
    // icon: path.join(__dirname, '../assets/icon.png'), // 如果有图标的话
    titleBarStyle: 'default',
    show: false // 先不显示，等待ready-to-show事件
  })

  // 在开发环境中加载 Vite 开发服务器，在生产环境中加载构建后的文件
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  
  console.log('环境信息:', {
    NODE_ENV: process.env.NODE_ENV,
    isPackaged: app.isPackaged,
    isDev: isDev
  })
  
  if (isDev) {
    console.log('开发模式：加载 Vite 开发服务器')
    mainWindow.loadURL('http://127.0.0.1:5173')
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    console.log('生产模式：加载本地文件')
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  // 窗口准备好显示时再显示，避免视觉闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 当窗口被关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 处理外部链接 - 在当前客户端中打开而不是外部浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url, frameName, features }) => {
    console.log('🚫 主进程拦截新窗口请求:', url)
    
    // 过滤无效的 URL
    if (url && url !== 'about:blank' && !url.startsWith('javascript:') && !url.startsWith('data:')) {
      // 通知渲染进程在当前标签页中打开新 URL
      mainWindow.webContents.send('open-url-in-current-tab', url)
    }
    
    return { action: 'deny' }
  })

  // 监听所有的 webContents 创建，确保每个 webview 也有相同的处理
  mainWindow.webContents.on('did-attach-webview', (event, webContents) => {
    webContents.setWindowOpenHandler(({ url }) => {
      console.log('🚫 WebView 拦截新窗口请求:', url)
      
      if (url && url !== 'about:blank' && !url.startsWith('javascript:') && !url.startsWith('data:')) {
        mainWindow.webContents.send('open-url-in-current-tab', url)
      }
      
      return { action: 'deny' }
    })
  })
}

/**
 * 创建菜单
 */
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '开启新探索',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('new-tab')
          }
        },
        {
          label: '结束当前页面',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.webContents.send('close-tab')
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '浏览',
      submenu: [
        {
          label: '返回上一页',
          accelerator: 'Alt+Left',
          click: () => {
            mainWindow.webContents.send('go-back')
          }
        },
        {
          label: '前往下一页',
          accelerator: 'Alt+Right',
          click: () => {
            mainWindow.webContents.send('go-forward')
          }
        },
        {
          label: '刷新页面',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('reload')
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '刷新页面', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制刷新', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { type: 'separator' },
        { label: '原始大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大显示', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小显示', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏模式', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于星辰浏览器',
          click: () => {
            // 可以在这里添加关于对话框
            shell.showItemInFolder(__filename)
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

/**
 * 设置 IPC 处理器
 */
function setupIPCHandlers() {
  console.log('🔧 正在注册 IPC 处理器...')

  // IPC 事件处理
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // 设置窗口透明度
  ipcMain.handle('set-window-opacity', (event, opacity) => {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const clampedOpacity = Math.max(0, Math.min(1.0, opacity)) // 允许透明度为 0
        mainWindow.setOpacity(clampedOpacity)
        return { success: true, opacity: clampedOpacity }
      }
      return { success: false, error: '窗口不可用' }
    } catch (err) {
      console.error('❌ 设置透明度失败:', err)
      return { success: false, error: err.message }
    }
  })

  // 获取窗口透明度
  ipcMain.handle('get-window-opacity', () => {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const opacity = mainWindow.getOpacity()
        return { success: true, opacity }
      }
      return { success: false, opacity: 1.0 }
    } catch (err) {
      console.error('❌ 获取透明度失败:', err)
      return { success: false, opacity: 1.0 }
    }
  })

  // 设置窗口总是在顶部
  ipcMain.handle('set-always-on-top', (event, flag) => {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setAlwaysOnTop(flag)
        return { success: true }
      }
      return { success: false, error: '窗口不可用' }
    } catch (err) {
      console.error('❌ 设置窗口置顶失败:', err)
      return { success: false, error: err.message }
    }
  })

  console.log('✅ IPC 处理器注册完成')
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  console.log('🚀 应用程序启动中...')
  
  // 首先设置 IPC 处理器
  setupIPCHandlers()
  
  // 然后创建窗口和菜单
  createWindow()
  createMenu()

  console.log('✅ 应用程序启动完成')

  app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
    // 通常会重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 在这个文件中，你可以包含应用的其余主进程代码
// 也可以将其分解为单独的文件并在此处要求它们 