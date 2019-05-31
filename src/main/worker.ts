import Logger from "./logger";
import { ChildProcess } from "child_process";
import { spawn, execSync } from "child_process";
import os from "os";
import fs from "fs-extra";
import path from "path";
import { app, ipcMain } from "electron";
import log from "electron-log";

class Controller {
  private executableDirectory: string;
  private executablePath: string;
  private child: null | ChildProcess;
  private logger: Logger;
  private userDataPath: string;
  private configPath: string;
  public constructor(logger: Logger) {
    let executableName = os.platform() === "darwin" ? "v2ray" : "v2ray.exe";
    if (global.ROOT.indexOf("app.asar") > 0) {
      this.executableDirectory = path
        .join(global.ROOT, "assets", "v2ray", "v2ray")
        .replace("app.asar", "app.asar.unpacked");
    } else {
      this.executableDirectory = path
        .join(
          global.ROOT,
          "assets",
          "v2ray",
          `v2ray-${os.platform() === "darwin" ? "macos" : "win"}`
        )
        .replace("app.asar", "app.asar.unpacked");
    }
    this.executablePath = path.join(this.executableDirectory, executableName);
    if (os.platform() === "darwin") {
      execSync(`chmod +x "${this.executablePath}"`);
      execSync(`chmod +x "${path.join(this.executableDirectory, "v2ctl")}"`);
    }
    this.child = null;
    this.logger = logger;
    this.userDataPath = app.getPath("userData");
    this.configPath = path.join(this.userDataPath, "v2ray.json");
    this.initConfig();
    ipcMain.on(
      "restart",
      (): void => {
        this.restart();
      }
    );
  }

  public start(): void {
    log.info("Starting worker ", this.executablePath);
    log.info("With config", this.configPath);
    this.child = spawn(this.executablePath, ["-config", this.configPath]);
    if (this.child) {
      this.child.stdout.on(
        "data",
        (data): void => {
          this.logger.append(data);
        }
      );
      this.child.stderr.on(
        "data",
        (data): void => {
          this.logger.append(data);
        }
      );
    }
  }

  public restart(): void {
    log.info("Restarting worker ", this.executablePath);
    this.child && this.child.kill();
    this.start();
  }

  public stop(): void {
    this.child && this.child.kill();
  }

  private initConfig(): void {
    if (!fs.existsSync(this.configPath)) {
      log.info("Config file not exists. Copying from default config file.");
      let defaultConfigPath = path.join(
        global.ROOT,
        "assets",
        "v2ray",
        `v2ray-${os.platform() === "darwin" ? "macos" : "win"}`,
        "config.json.default"
      );
      fs.copySync(defaultConfigPath, this.configPath);
    }
  }
}

export { Controller };
