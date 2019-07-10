import path from "path";
import os from "os";
import isDev from "electron-is-dev";

const getV2RayAsset = (name: string): string => {
  const root = isDev ? path.join(__dirname, "..", "..") : path.join(__dirname);
  if (root.indexOf("app.asar") > 0) {
    return path
      .join(root, "assets", "v2ray", "v2ray", name)
      .replace("app.asar", "app.asar.unpacked");
  } else {
    return path.join(
      root,
      "assets",
      "v2ray",
      `v2ray-${os.platform() === "darwin" ? "macos" : "win"}`,
      name
    );
  }
};

export { getV2RayAsset };
