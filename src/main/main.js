const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { CommandEngine } = require('../services/commandEngine');
const { AIRouter } = require('../services/aiRouter');
const { MemoryManager } = require('../services/memoryManager');

let mainWindow;
let commandEngine;
let aiRouter;
let memoryManager;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function initializeServices() {
  memoryManager = new MemoryManager();
  commandEngine = new CommandEngine();
  aiRouter = new AIRouter(memoryManager);
}

// Window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Chat message handling
ipcMain.handle('send-message', async (_event, message) => {
  try {
    // Check if it's a system command first
    const commandResult = commandEngine.tryExecute(message);
    if (commandResult) {
      memoryManager.addMessage('user', message);
      memoryManager.addMessage('assistant', commandResult.response);
      return {
        success: true,
        response: commandResult.response,
        type: 'command',
        commandType: commandResult.type
      };
    }

    // Route to AI
    const conversationHistory = memoryManager.getConversationHistory();
    const aiResponse = await aiRouter.route(message, conversationHistory);

    memoryManager.addMessage('user', message);
    memoryManager.addMessage('assistant', aiResponse.response);

    return {
      success: true,
      response: aiResponse.response,
      type: 'ai',
      provider: aiResponse.provider,
      model: aiResponse.model
    };
  } catch (error) {
    return {
      success: false,
      response: 'I apologize, but I encountered an error processing your request. Please try again.',
      error: error.message
    };
  }
});

// Get conversation history
ipcMain.handle('get-history', () => {
  return memoryManager.getConversationHistory();
});

// Clear conversation
ipcMain.handle('clear-conversation', () => {
  memoryManager.clearConversation();
  return { success: true };
});

// Get AI status
ipcMain.handle('get-ai-status', () => {
  return aiRouter.getStatus();
});

// Get settings
ipcMain.handle('get-settings', () => {
  return aiRouter.getSettings();
});

// Update settings
ipcMain.handle('update-settings', (_event, settings) => {
  aiRouter.updateSettings(settings);
  return { success: true };
});

app.whenReady().then(() => {
  initializeServices();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
