import path from "path";
import { app, Menu } from "electron";
import { initTray } from "./tray";
import { SystemProxy } from "./proxy_conf_helper";
import { Controller } from "./worker";
import Logger from "./logger";
import os from "os";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import isDev from "electron-is-dev";

require("electron-debug")({ showDevTools: true });
log.transports.file.level = "debug";
global.ROOT = isDev
  ? path.join(__dirname, "..", "..")
  : path.join(__dirname);
let systemProxy = os.platform() === "darwin" ? new SystemProxy() : null;
let logger = new Logger();
let worker = new Controller(logger);

app.on("ready", () => {
  log.info("App ready");

  const template = [
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteandmatchstyle" },
        { role: "delete" },
        { role: "selectall" }
      ]
    }
  ];
  // @ts-ignore
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
  if (os.platform() === "darwin") app.dock.hide();
  initTray(worker, logger, systemProxy);
});

app.on("window-all-closed", () => {
  if (os.platform() === "darwin") {
    app.dock.hide();
  }
});

app.on("browser-window-created", () => {
  if (os.platform() === "darwin") {
    app.dock.show();
  }
});

app.on("quit", () => {
  worker.stop();
  if (systemProxy) {
    systemProxy.turnOffSystemProxyIfEnabled();
  }
  log.info("App quit");
});

autoUpdater.on("update-not-available", info => {
  setTimeout(() => autoUpdater.checkForUpdates(), 3600000);
});

autoUpdater.on("error", err => {
  setTimeout(() => autoUpdater.checkForUpdates(), 3600000);
});

log.catchErrors();