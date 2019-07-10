import path from "path";
import os from "os";

const getV2RayAsset = (name: string): string => {
  if (global.ROOT.indexOf("app.asar") > 0) {
    return path
      .join(global.ROOT, "assets", "v2ray", "v2ray", name)
      .replace("app.asar", "app.asar.unpacked");
  } else {
    return path.join(
      global.ROOT,
      "assets",
      "v2ray",
      `v2ray-${os.platform() === "darwin" ? "macos" : "win"}`,
      name
    );
  }
};

export { getV2RayAsset };
