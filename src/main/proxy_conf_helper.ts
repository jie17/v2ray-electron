import { execFileSync } from "child_process";
import { app, MenuItem, ipcMain } from "electron";
import path from "path";
import http, { Server } from "http";
import fs from "fs";
import sudo from "sudo-prompt";
import Store from "electron-store";
const store = new Store<string>();

type Mode = "standalone" | "pac" | "global";

class SystemProxy {
  private userDataPath: string;
  private mode?: Mode;
  public menuItems: {
    standalone: MenuItem;
    pac: MenuItem;
    global: MenuItem;
  };
  private pacServer: Server | null;
  private bundledProxyConfHelperPath: string;
  private pacPath: string;
  private proxyConfHelperPath: string;
  public constructor() {
    this.pacServer = null;
    this.menuItems = {
      standalone: new MenuItem({
        label: "Standalone Mode",
        type: "radio",
        click: () => {
          this.applyMode("standalone");
        },
      }),
      pac: new MenuItem({
        label: "Pac Mode",
        type: "radio",
        click: () => {
          this.applyMode("pac");
        },
      }),
      global: new MenuItem({
        label: "Global Mode",
        type: "radio",
        click: () => {
          this.applyMode("global");
        },
      }),
    };
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
    let mode = store.get("proxy-mode");
    if (mode) {
      this.applyMode(mode as Mode);
    } else {
      this.setMode("standalone");
    }
    ipcMain.on("reset pac", (): void => {
      if (this.mode === "pac") {
        this.applyMode("standalone");
        this.applyMode("pac");
      }
    });
  }

  private installHelper(): void {
    console.log("path", this.proxyConfHelperPath);
    if (!fs.existsSync(this.proxyConfHelperPath)) {
      let options = {
        name: app.getName(),
        icns: path.join(global.ROOT, "assets", "icon.icns"),
      };
      let command = `cp "${this.bundledProxyConfHelperPath}" "${this.proxyConfHelperPath}" && chown root:admin "${this.proxyConfHelperPath}" && chmod a+rx "${this.proxyConfHelperPath}" && chmod +s "${this.proxyConfHelperPath}"`;
      sudo.exec(command, options, (error: Error): void => {
        if (error) {
          console.error(error);
        } else {
          console.log("Successfully installed helper");
        }
      });
    }
  }

  private applyMode(mode: Mode): void {
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
              "http://localhost:22222/proxy.pac",
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

  private applyModePacServer(mode: string): void {
    if (mode === "pac") {
      this.turnOnPacServer();
    } else {
      this.turnOffPacServer();
    }
  }

  public setMode(mode: Mode): void {
    this.mode = mode;
    Object.values(this.menuItems).forEach((menuItem): void => {
      menuItem.checked = false;
    });
    this.menuItems[this.mode].checked = true;
    store.set("proxy-mode", mode);
  }

  public turnOffSystemProxyIfEnabled(): void {
    if (this.mode !== "standalone")
      execFileSync(this.proxyConfHelperPath, ["-m", "off"]);
  }

  private turnOffPacServer(): void {
    if (this.pacServer) {
      this.pacServer.close();
      this.pacServer = null;
    }
  }

  private turnOnPacServer(): void {
    let pacPath = this.pacPath;
    this.pacServer = http
      .createServer(function (req, res): void {
        fs.readFile(pacPath, function (err, file): void {
          if (err) {
            res.writeHead(500, {
              "Content-Type": "text/plain",
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
