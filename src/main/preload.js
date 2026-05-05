const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jarvis', {
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearConversation: () => ipcRenderer.invoke('clear-conversation'),
  getAIStatus: () => ipcRenderer.invoke('get-ai-status'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),

  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
});
