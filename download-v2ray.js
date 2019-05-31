const version = "v4.18.0";

import fs from "fs-extra";
import os from "os";
import request from "request";
import unzipper from "unzipper";

function setPlatform(platform) {
  if (platform === "win32") {
    let url = `https://github.com/v2ray/v2ray-core/releases/download/${version}/v2ray-windows-64.zip`;
    let filename = `v2ray-${version}-windows-64.zip`;
    let extractDir = `v2ray-${version}-windows-64`;
    let targetDir = "v2ray-win";
    let executableName = "v2ray.exe";
    return {
      url,
      filename,
      extractDir: extractDir,
      targetDir: targetDir,
      executableName
    };
  }
  if (platform === "darwin") {
    let url = `https://github.com/v2ray/v2ray-core/releases/download/${version}/v2ray-macos.zip`;
    let filename = `v2ray-${version}-macos.zip`;
    let extractDir = `v2ray-${version}-macos`;
    let targetDir = "v2ray-macos";
    let executableName = "v2ray";
    return {
      url,
      filename,
      extractDir: extractDir,
      targetDir: targetDir,
      executableName
    };
  }
}

function switchIntoWorkSpace() {
  // Create v2ray if not exists and enter the folder
  let dir = "assets/v2ray";
  if (!fs.existsSync(dir)) {
    fs.ensureDirSync(dir);
  }
  process.chdir(dir);
}

function removeIfExists(path) {
  if (fs.existsSync(path)) {
    fs.removeSync(path);
  }
}

function cleanUpOldFiles(params) {
  removeIfExists(params.targetDir);
  removeIfExists(params.extractDir);
}

function alreadyExists(params) {
  return fs.existsSync(params.filename);
}

function unzipAndMove(params) {
  fs.createReadStream(params.filename)
    .pipe(unzipper.Extract({ path: `${process.cwd()}/${params.extractDir}` }))
    .on("finish", () => {
      fs.renameSync(
        `./${params.extractDir}/config.json`,
        `./${params.extractDir}/config.json.default`
      );
      // Avoid "EPERM: operation not permitted" on Windows
      setTimeout(function() {
        fs.renameSync(`./${params.extractDir}`, `./${params.targetDir}`);
      }, 1000);
    });
}

function download(params) {
  console.log("Downloading ", params.url);
  request(params.url)
    .pipe(fs.createWriteStream(params.filename))
    .on("finish", () => {
      unzipAndMove(params);
    });
}

function runTaskOnPlatform(platform) {
  let params = setPlatform(platform);
  cleanUpOldFiles(params);
  if (!alreadyExists(params)) {
    download(params);
  } else {
    unzipAndMove(params);
  }
}

function runningOnTravis() {
  return "TRAVIS" in process.env && "CI" in process.env;
}

switchIntoWorkSpace();

if (runningOnTravis()) {
  ["win32", "darwin"].forEach(platform => runTaskOnPlatform(platform));
} else {
  runTaskOnPlatform(os.platform());
}
