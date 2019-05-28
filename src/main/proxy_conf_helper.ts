import { execFileSync } from "child_process";
import { app, MenuItem, ipcMain } from "electron";
import path from "path";
import http, { Server } from "http";
import fs from "fs";
import sudo from "sudo-prompt";
import Store from "electron-store";
const store = new Store<string>();

class SystemProxy {
  userDataPath: string;
  enabled: boolean;
  mode: string;
  menuItems: {
    standalone: MenuItem;
    pac: MenuItem;
    global: MenuItem;
  };
  pac_server: Server | null;
  bundledProxyConfHelperPath: string;
  pacPath: string;
  proxyConfHelperPath: string;
  constructor() {
    this.enabled = false;
    this.pac_server = null;
    // @ts-ignore
    this.menuItems = {};
    this.mode = "";
    this.userDataPath = app.getPath("userData");
    this.pacPath = path.join(this.userDataPath, "proxy.pac");
    this.proxyConfHelperPath = path.join(
      this.userDataPath,
      "proxy_conf_helper"
    );
    this.bundledProxyConfHelperPath = path
      .join(global.ROOT, "assets", "proxy_conf_helper")
      .replace("app.asar", "app.asar.unpacked");
    this.installHelper();
    this.initializeMenuItems();
    let mode = store.get("proxy-mode");
    if (mode) {
      this.applyMode(mode);
    } else {
      this.setMode("standalone");
    }
    ipcMain.on("reset pac", () => {
      if (this.mode === "pac") {
        this.applyMode("standalone");
        this.applyMode("pac");
      }
    });
  }

  installHelper() {
    console.log('path', this.proxyConfHelperPath);
    if (!fs.existsSync(this.proxyConfHelperPath)) {
      let options = {
        name: app.getName(),
        icns: path.join(global.ROOT, "assets", "icon.icns")
      };
      let command = `cp "${this.bundledProxyConfHelperPath}" "${
        this.proxyConfHelperPath
      }" && chown root:admin "${this.proxyConfHelperPath}" && chmod a+rx "${
        this.proxyConfHelperPath
      }" && chmod +s "${this.proxyConfHelperPath}"`;
      sudo.exec(command, options, (error: Error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Successfully installed helper");
        }
      });
    }
  }

  initializeMenuItems() {
    let me = this;
    me.menuItems = {
      standalone: new MenuItem({
        label: "Standalone Mode",
        type: "radio",
        click(menuItem, browserWindow, event) {
          me.applyMode("standalone");
        }
      }),
      pac: new MenuItem({
        label: "Pac Mode",
        type: "radio",
        click(menuItem, browserWindow, event) {
          me.applyMode("pac");
        }
      }),
      global: new MenuItem({
        label: "Global Mode",
        type: "radio",
        click(menuItem, browserWindow, event) {
          me.applyMode("global");
        }
      })
    };
  }

  applyMode(mode: string) {
    let realHelperPath;
    if (fs.existsSync(this.proxyConfHelperPath)) {
      realHelperPath = this.proxyConfHelperPath;
      if (mode !== this.mode) {
        switch (mode) {
          case "standalone":
            execFileSync(realHelperPath, ["-m", "off"]);
            break;
          case "pac":
            execFileSync(realHelperPath, [
              "-m",
              "auto",
              "-u",
              "http://localhost:22222/proxy.pac"
            ]);
            break;
          case "global":
            execFileSync(realHelperPath, ["-m", "global", "-p", "1080"]);
            break;
        }
        this.applyModePacServer(mode);
      }
    }
    this.setMode(mode);
  }

  applyModePacServer(mode: string) {
    if (mode === "pac") {
      this.turnOnPacServer();
    } else {
      this.turnOffPacServer();
    }
  }

  setMode(mode: string) {
    this.mode = mode;
    Object.values(this.menuItems).forEach(
      menuItem => (menuItem.checked = false)
    );
    // @ts-ignore
    this.menuItems[this.mode].checked = true;
    store.set("proxy-mode", mode);
  }

  turnOffSystemProxyIfEnabled() {
    if (this.mode !== "standalone")
      execFileSync(this.proxyConfHelperPath, ["-m", "off"]);
  }

  turnOffPacServer() {
    if (this.pac_server) {
      this.pac_server.close();
      this.pac_server = null;
    }
  }

  turnOnPacServer() {
    let pacPath = this.pacPath;
    this.pac_server = http
      .createServer(function(req, res) {
        fs.readFile(pacPath, function(err, file) {
          if (err) {
            res.writeHead(500, {
              "Content-Type": "text/plain"
            });
            res.write(err + "\n");
            res.end();
            return;
          }

          res.writeHead(200);
          res.write(file);
          res.end();
        });
      })
      .listen(22222, "127.0.0.1");
  }
}

export { SystemProxy };
