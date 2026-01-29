const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Thermal printer integration
    printReceipt: (receiptData) => ipcRenderer.invoke('print-receipt', receiptData),

    // Backend status check
    getBackendStatus: () => ipcRenderer.invoke('get-backend-status'),

    // Platform info
    platform: process.platform,

    // App version (if needed)
    // appVersion: process.env.npm_package_version
});
