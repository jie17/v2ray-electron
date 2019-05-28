import { BrowserWindow } from "electron";
declare const __static: string;

class ConfigEditor {
  win: null | BrowserWindow;
  constructor() {
    this.win = null;
  }

  launch() {
    if (!this.win) {
      this.win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Configuration Editor - V2Ray Electron",
        webPreferences: { nodeIntegration: true }
      });
      this.win.on("closed", () => {
        this.win = null;
      });

      this.win.setMenu(null);
      this.win.loadURL(`file://${__static}/pages/config-editor/index.html`);
    } else {
      this.win.focus();
    }
  }
}

export { ConfigEditor };
