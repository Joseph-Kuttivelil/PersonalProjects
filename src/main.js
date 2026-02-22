// src/main.js — Main Electron Process
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { ChatGPTService } = require('./chatgpt-service');
const { RulesetEngine } = require('./ruleset-engine');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 700,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // Security: keep renderer & main isolated
      nodeIntegration: false,   // Security: no direct Node access in renderer
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f0f0f',
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── IPC Handlers ────────────────────────────────────────────────────────────

const chatService = new ChatGPTService();
const rulesetEngine = new RulesetEngine();

/**
 * Handle a chat message from the renderer.
 * The ruleset engine processes the prompt BEFORE it is sent to ChatGPT.
 */
ipcMain.handle('chat:sendMessage', async (_event, { userMessage, conversationHistory }) => {
  try {
    // 1. Validate & transform prompt through the ruleset engine
    const ruleResult = rulesetEngine.process(userMessage);
    if (!ruleResult.allowed) {
      return { success: false, error: ruleResult.reason };
    }

    // 2. Send the (possibly transformed) prompt to ChatGPT
    const response = await chatService.sendMessage(
      ruleResult.transformedPrompt,
      conversationHistory
    );

    return { success: true, message: response };
  } catch (err) {
    console.error('[chat:sendMessage]', err);
    return { success: false, error: err.message };
  }
});

/** Let the renderer read the current ruleset */
ipcMain.handle('ruleset:get', () => rulesetEngine.getRules());

/** Let the renderer update a rule's enabled state */
ipcMain.handle('ruleset:toggle', (_event, { ruleId, enabled }) => {
  rulesetEngine.toggleRule(ruleId, enabled);
  return rulesetEngine.getRules();
});

/** Save API key (stored in-memory for the session; persist as needed) */
ipcMain.handle('config:setApiKey', (_event, apiKey) => {
  chatService.setApiKey(apiKey);
  return { success: true };
});
