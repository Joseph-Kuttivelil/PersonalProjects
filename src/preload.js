// src/preload.js — Secure Bridge between Main & Renderer
const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose a safe, typed API surface to the renderer.
 * The renderer never has direct access to Node.js or Electron internals.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Chat
  sendMessage: (payload) => ipcRenderer.invoke('chat:sendMessage', payload),

  // Ruleset management
  getRules: () => ipcRenderer.invoke('ruleset:get'),
  toggleRule: (ruleId, enabled) => ipcRenderer.invoke('ruleset:toggle', { ruleId, enabled }),

  // Config
  setApiKey: (apiKey) => ipcRenderer.invoke('config:setApiKey', apiKey),
});
