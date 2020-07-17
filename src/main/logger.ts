import { BrowserWindow } from "electron";
import * as path from "path";
import { format as formatUrl } from "url";
const MAX_LINE_NUMBER = 1024;

const isDevelopment = process.env.NODE_ENV !== "production";

export default class Logger {
  private windowOpen: boolean;
  private win: null | BrowserWindow;
  private logId: number;
  public constructor() {
    global.store = [];
    this.windowOpen = false;
    this.win = null;
    this.logId = 0;
  }

  public append(data: Buffer): void {
    let lines = data.toString().split("\n");
    if (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.pop();
    }
    global.store = [
      ...global.store,
      ...lines.map((line): LogLine => ({ line, id: this.logId++ })),
    ];
    if (global.store.length > MAX_LINE_NUMBER) {
      global.store = global.store.slice(global.store.length - MAX_LINE_NUMBER);
    }
    if (this.windowOpen) {
      this.win && this.win.webContents.send("log", lines);
    }
  }

  public showWindow(): void {
    if (!this.win) {
      this.win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Log Viewer - V2Ray Electron",
        webPreferences: { nodeIntegration: true },
      });
      this.win.on("closed", (): void => {
        this.win = null;
        this.windowOpen = false;
      });

      this.win.setMenu(null);
      if (isDevelopment) {
        this.win.loadURL(
          `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?route=logViewer`
        );
      } else {
        this.win.loadURL(
          formatUrl({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file",
            slashes: true,
            query: { route: "logViewer" },
          })
        );
      }
      this.windowOpen = true;
    } else {
      this.win.focus();
    }
  }
}
