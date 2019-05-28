const { BrowserWindow } = require("electron");
const { PassThrough } = require("stream");

const MAX_LINE_NUMBER = 1024;

class Logger {
  constructor() {
    this.store = [];
    this.windowOpen = false;
    this.win = null;
  }

  append(data) {
    let lines = data.toString().split("\n");
    console.log("r", lines.length, lines[lines.length - 1]);
    if (lines.length > 0 && lines[lines.length - 1] == "") {
      lines.pop();
    }
    this.store = [...this.store, ...lines];
    if (this.store.length > MAX_LINE_NUMBER) {
      this.store = this.store.slice(this.store.length - MAX_LINE_NUMBER);
    }
    if (this.windowOpen) {
      this.win.webContents.send("log", lines);
    }
  }

  showWindow() {
    if (!this.win) {
      this.win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Log Viewer - V2Ray Electron"
      });
      this.win.on("closed", () => {
        this.win = null;
        this.windowOpen = false;
      });

      this.win.setMenu(null);
      this.win.loadURL(`file://${__dirname}/pages/logger/index.html`);
      this.win.webContents.on("did-finish-load", () => {
        this.win.webContents.send("log", this.store);
      });
      this.windowOpen = true;
    } else {
      this.win.focus();
    }
  }
}

exports.Logger = Logger;
