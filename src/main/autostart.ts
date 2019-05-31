import AutoLaunch from "auto-launch";
import { app } from "electron";

class AutoStart {
  private autoLauncher: AutoLaunch;
  public constructor() {
    this.autoLauncher = new AutoLaunch({
      mac: {
        useLaunchAgent: true
      },
      name: app.getName()
    });
  }

  public isEnabled(): Promise<boolean> {
    return this.autoLauncher.isEnabled();
  }

  public toggle(): Promise<boolean> {
    return this.isEnabled().then(
      (isEnabled): boolean => {
        if (isEnabled) {
          this.autoLauncher.disable();
        } else {
          this.autoLauncher.enable();
        }
        return isEnabled;
      }
    );
  }
}

export { AutoStart };
