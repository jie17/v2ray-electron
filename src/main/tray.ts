import { Menu, MenuItem, Tray, app } from "electron";
import { ConfigEditor } from "./config-editor";
import { PacEditor } from "./pac-editor";
import { SystemProxy } from "./proxy_conf_helper";
import { AutoStart } from "./autostart";
import os from "os";
import path from "path";
import openAboutWindow from "about-window";
import Logger from "./logger";
import { Controller } from "./worker";

function initTray(
  worker: Controller,
  logger: Logger,
  systemProxy: SystemProxy | null
) {
  const tray = new Tray(
    path.join(global.ROOT, "assets", `icon-${os.platform()}.png`)
  );
  console.log(tray);
  let autoStart = new AutoStart();
  let contextMenu = new Menu();
  let configEditor = new ConfigEditor();
  let pacEditor = new PacEditor();

  if (systemProxy) {
    for (let key in systemProxy.menuItems) {
      // @ts-ignore
      contextMenu.append(systemProxy.menuItems[key]);
    }

    contextMenu.append(
      new MenuItem({
        type: "separator"
      })
    );
  }

  contextMenu.append(
    new MenuItem({
      label: "Restart V2Ray",
      click() {
        worker.restart();
      }
    })
  );

  let menuForAutoStart = new MenuItem({
    label: "Start on Boot",
    type: "checkbox",
    click: () => {
      autoStart.toggle().then(isEnabled => {
        menuForAutoStart.checked = isEnabled;
      });
    }
  });
  contextMenu.append(menuForAutoStart);
  autoStart
    .isEnabled()
    .then(isEnabled => (menuForAutoStart.checked = isEnabled));

  contextMenu.append(
    new MenuItem({
      label: "Edit V2Ray Config",
      click() {
        configEditor.launch();
      }
    })
  );

  if (os.platform() === "darwin") {
    contextMenu.append(
      new MenuItem({
        label: "Edit PAC File",
        click() {
          pacEditor.launch();
        }
      })
    );
  }

  contextMenu.append(
    new MenuItem({
      label: "Show V2Ray Log",
      click() {
        logger.showWindow();
      }
    })
  );

  contextMenu.append(
    new MenuItem({
      label: `About ${app.getName()}`,
      click(item, focusedWindow) {
        openAboutWindow({
          icon_path: path.join(__dirname, "assets", "icon-win32.png")
        });
      }
    })
  );

  contextMenu.append(
    new MenuItem({
      role: "quit"
    })
  );

  tray.setToolTip("V2Ray");
  tray.setContextMenu(contextMenu);

  worker.start();
}

export { initTray };
