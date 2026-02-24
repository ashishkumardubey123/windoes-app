const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require("electron");
const path = require("path");

// Har monitor ke liye alag window store karenge
// wins[0] = primary monitor (face recognition wala)
// wins[1], wins[2]... = baaki monitors (simple black lock screen)
let wins = [];
let isLocked = true;

// ─── Sabhi windows ko ek saath broadcast karo ─────────────────────────────────
function broadcastLockState(source) {
  wins.forEach((w) => {
    if (w && !w.isDestroyed() && !w.webContents.isDestroyed()) {
      w.webContents.send("lock-state-changed", { locked: isLocked, source });
    }
  });
}

// ─── Primary monitor ke liye window (face recognition wali) ──────────────────
function createPrimaryWindow(display) {
  const { x, y, width, height } = display.bounds;

  const w = new BrowserWindow({
    x, y, width, height,
    fullscreen: true,
    kiosk: true,
    alwaysOnTop: true,
    frame: false,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  w.loadURL("http://localhost:5173");

  w.webContents.on("did-finish-load", () => {
    isLocked = true;
    broadcastLockState("startup");
  });

  return w;
}

// ─── Secondary monitors ke liye simple black lock window ─────────────────────
function createSecondaryWindow(display) {
  const { x, y, width, height } = display.bounds;

  const w = new BrowserWindow({
    x, y, width, height,
    fullscreen: true,
    kiosk: true,
    alwaysOnTop: true,
    frame: false,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Simple black screen with lock message
  w.loadURL("http://localhost:5173/lock");

  // Agar /lock route nahi hai to inline HTML load karo
  w.webContents.on("did-fail-load", () => {
    w.loadURL(`data:text/html,
      <html>
        <body style="
          margin:0; padding:0;
          background:#030507;
          display:flex;
          align-items:center;
          justify-content:center;
          height:100vh;
          font-family:'Segoe UI',sans-serif;
        ">
          <div style="text-align:center; color:rgba(255,255,255,0.15)">
            <div style="font-size:48px; font-weight:200; letter-spacing:0.1em">🔒</div>
            <div style="font-size:13px; letter-spacing:0.2em; margin-top:12px; text-transform:uppercase">
              Display Locked
            </div>
          </div>
        </body>
      </html>
    `);
  });

  return w;
}

// ─── Sabhi monitors par windows banao ────────────────────────────────────────
function createAllWindows() {
  const displays = screen.getAllDisplays();
  const primary  = screen.getPrimaryDisplay();

  console.log(`${displays.length} monitor(s) detected`);

  displays.forEach((display) => {
    const isPrimary = display.id === primary.id;
    const w = isPrimary
      ? createPrimaryWindow(display)
      : createSecondaryWindow(display);

    wins.push(w);
    console.log(`Window created on ${isPrimary ? "PRIMARY" : "SECONDARY"} monitor — bounds:`, display.bounds);
  });

  // Escape shortcuts block karo
  globalShortcut.register("Alt+F4", () => console.log("Alt+F4 blocked"));
  globalShortcut.register("CommandOrControl+R", () => console.log("Reload blocked"));
}

// ─── Lock — sabhi windows ek saath ───────────────────────────────────────────
async function lockAllWindows(source = "manual") {
  console.log(`LOCK requested (${source}) — ${wins.length} window(s)`);
  isLocked = true;

  wins.forEach((w) => {
    if (!w || w.isDestroyed()) return;
    w.setAlwaysOnTop(true);
    w.setFullScreen(true);
    w.setKiosk(true);
    w.show();
    w.focus();
  });

  broadcastLockState(source);

  // Primary window ko focus do (face recognition wali)
  const primary = wins[0];
  if (primary && !primary.isDestroyed()) primary.focus();

  return { ok: true };
}

// ─── Unlock — sabhi windows ek saath hide karo ───────────────────────────────
async function unlockAllWindows() {
  console.log(`FACE MATCHED — unlocking ${wins.length} window(s)`);
  isLocked = false;

  broadcastLockState("face-match");

  wins.forEach((w) => {
    if (!w || w.isDestroyed()) return;
    w.setAlwaysOnTop(false);
    w.setKiosk(false);
    w.setFullScreen(false);
    w.hide();
  });

  return { ok: true };
}

// ─── App start ────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createAllWindows();

  // Ctrl+Shift+L => sabhi lock + frontend call
  globalShortcut.register("CommandOrControl+Shift+L", () => {
    console.log("Ctrl+Shift+L — locking all monitors");
    void lockAllWindows("manual-shortcut");
    // Primary window (face recognition) ko signal bhejo
    const primary = wins[0];
    if (primary && !primary.isDestroyed() && !primary.webContents.isDestroyed()) {
      primary.webContents.send("shortcut-shift-l");
    }
  });

  // Naya monitor connect hone par uski bhi window banao
  screen.on("display-added", (event, newDisplay) => {
    console.log("New monitor connected — creating window");
    const w = createSecondaryWindow(newDisplay);
    wins.push(w);
    if (isLocked) {
      w.setAlwaysOnTop(true);
      w.setFullScreen(true);
      w.setKiosk(true);
      w.show();
    }
  });

  // Monitor disconnect hone par us window ko close karo
  screen.on("display-removed", (event, oldDisplay) => {
    console.log("Monitor disconnected — removing window");
    wins = wins.filter((w) => {
      if (!w || w.isDestroyed()) return false;
      const [wx, wy] = w.getPosition();
      const b = oldDisplay.bounds;
      const belongs = wx >= b.x && wx < b.x + b.width && wy >= b.y && wy < b.y + b.height;
      if (belongs) { w.close(); return false; }
      return true;
    });
  });
});

// ─── IPC handlers ─────────────────────────────────────────────────────────────
ipcMain.handle("lock",   async () => lockAllWindows("renderer-request"));
ipcMain.handle("unlock", unlockAllWindows);
ipcMain.on("unlock",     () => void unlockAllWindows());

// ─── Cleanup ──────────────────────────────────────────────────────────────────
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});