import path from "path";
import { app, Menu } from "electron";
import { initTray } from "./tray";
import { SystemProxy } from "./proxy_conf_helper";
import { Controller } from "./worker";
import Logger from "./logger";
import os from "os";
import log from "electron-log";
import { autoUpdater, UpdateCheckResult } from "electron-updater";
import isDev from "electron-is-dev";

log.transports.file.level = "debug";
global.ROOT = isDev ? path.join(__dirname, "..", "..") : path.join(__dirname);
let systemProxy = os.platform() === "darwin" ? new SystemProxy() : null;
let logger = new Logger();
let worker = new Controller(logger);
let tray = null;

app.on("ready", (): void => {
  log.info("App ready");

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
  if (os.platform() === "darwin") app.dock.hide();
  tray = initTray(worker, logger, systemProxy);
  tray.setToolTip("V2Ray");
});

app.on("window-all-closed", (): void => {
  if (os.platform() === "darwin") {
    app.dock.hide();
  }
});

app.on("browser-window-created", (): void => {
  if (os.platform() === "darwin") {
    app.dock.show();
  }
});

app.on("quit", (): void => {
  worker.stop();
  if (systemProxy) {
    systemProxy.turnOffSystemProxyIfEnabled();
  }
  log.info("App quit");
});

autoUpdater.on("update-not-available", (): void => {
  setTimeout(
    (): Promise<UpdateCheckResult> => autoUpdater.checkForUpdates(),
    3600000
  );
});

autoUpdater.on("error", (): void => {
  setTimeout(
    (): Promise<UpdateCheckResult> => autoUpdater.checkForUpdates(),
    3600000
  );
});

log.catchErrors();
