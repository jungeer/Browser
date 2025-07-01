const { contextBridge, ipcRenderer } = require('electron')

/**
 * 安全地暴露 API 给渲染进程
 * 这些 API 可以在 Vue 组件中通过 window.electronAPI 访问
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 监听主进程发送的消息
  onNewTab: (callback) => ipcRenderer.on('new-tab', callback),
  onCloseTab: (callback) => ipcRenderer.on('close-tab', callback),
  onGoBack: (callback) => ipcRenderer.on('go-back', callback),
  onGoForward: (callback) => ipcRenderer.on('go-forward', callback),
  onReload: (callback) => ipcRenderer.on('reload', callback),
  onOpenUrlInCurrentTab: (callback) => ipcRenderer.on('open-url-in-current-tab', callback),
  onToggleDevTools: (callback) => ipcRenderer.on('toggle-dev-tools', callback),
  
  // 窗口控制 API
  setWindowOpacity: (opacity) => ipcRenderer.invoke('set-window-opacity', opacity),
  getWindowOpacity: () => ipcRenderer.invoke('get-window-opacity'),
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('set-always-on-top', flag),
  toggleMainDevTools: () => ipcRenderer.invoke('toggle-main-dev-tools'),
  
  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
}) 