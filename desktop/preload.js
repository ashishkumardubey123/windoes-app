const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Preferred: returns { ok: boolean, reason?: string }
  unlock: () => ipcRenderer.invoke("unlock"),
  // Optional: lock from renderer if needed
  lock: () => ipcRenderer.invoke("lock"),
  // Backward-compatible fire-and-forget
  unlockLegacy: () => ipcRenderer.send("unlock"),
  // Renderer can restart/stop face loop based on locked state
  onLockStateChange: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("lock-state-changed", handler);
    return () => ipcRenderer.removeListener("lock-state-changed", handler);
  },
  // Shift+L shortcut ka event - frontend mein sunne ke liye
  onShiftL: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("shortcut-shift-l", handler);
    return () => ipcRenderer.removeListener("shortcut-shift-l", handler);
  },
});