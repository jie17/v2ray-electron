import { BrowserWindow } from "electron";
import { format as formatUrl } from "url";
import * as path from "path";

const isDevelopment = process.env.NODE_ENV !== "production";

class ConfigEditor {
  private win: null | BrowserWindow;
  public constructor() {
    this.win = null;
  }

  public launch(): void {
    if (!this.win) {
      this.win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Configuration Editor - V2Ray Electron",
        webPreferences: { nodeIntegration: true }
      });
      this.win.on(
        "closed",
        (): void => {
          this.win = null;
        }
      );

      this.win.setMenu(null);
      if (isDevelopment) {
        this.win.loadURL(
          `http://localhost:${
            process.env.ELECTRON_WEBPACK_WDS_PORT
          }?route=configEditor`
        );
      } else {
        this.win.loadURL(
          formatUrl({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file",
            slashes: true,
            query: { route: "configEditor" }
          })
        );
      }
    } else {
      this.win.focus();
    }
  }
}

export { ConfigEditor };
