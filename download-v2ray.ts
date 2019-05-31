import * as os from "os";
import * as request from "request";
import * as fs from "fs-extra";
import { Extract } from "unzipper";

const version = "v4.18.0";

interface Params {
  url: string;
  filename: string;
  extractDir: string;
  targetDir: string;
  executableName: string;
}

function setPlatform(platform: NodeJS.Platform): Params | null {
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
  return null;
}

function switchIntoWorkSpace(): void {
  // Create v2ray if not exists and enter the folder
  let dir = "assets/v2ray";
  if (!fs.existsSync(dir)) {
    fs.ensureDirSync(dir);
  }
  process.chdir(dir);
}

function removeIfExists(path: string): void {
  if (fs.existsSync(path)) {
    fs.removeSync(path);
  }
}

function cleanUpOldFiles(params: Params): void {
  removeIfExists(params.targetDir);
  removeIfExists(params.extractDir);
}

function alreadyExists(params: Params): boolean {
  return fs.existsSync(params.filename);
}

function unzipAndMove(params: Params): void {
  fs.createReadStream(params.filename)
    .pipe(Extract({ path: `${process.cwd()}/${params.extractDir}` }))
    .on(
      "finish",
      (): void => {
        fs.renameSync(
          `./${params.extractDir}/config.json`,
          `./${params.extractDir}/config.json.default`
        );
        // Avoid "EPERM: operation not permitted" on Windows
        setTimeout(function(): void {
          fs.renameSync(`./${params.extractDir}`, `./${params.targetDir}`);
        }, 1000);
      }
    );
}

function download(params: Params): void {
  console.log("Downloading ", params.url);
  request(params.url)
    .pipe(fs.createWriteStream(params.filename))
    .on(
      "finish",
      (): void => {
        unzipAndMove(params);
      }
    );
}

function runTaskOnPlatform(platform: NodeJS.Platform): void {
  let params = setPlatform(platform);
  if (params) {
    cleanUpOldFiles(params);
    if (!alreadyExists(params)) {
      download(params);
    } else {
      unzipAndMove(params);
    }
  }
}

function runningOnTravis(): boolean {
  return "TRAVIS" in process.env && "CI" in process.env;
}

switchIntoWorkSpace();

if (runningOnTravis()) {
  const platforms: NodeJS.Platform[] = ["win32", "darwin"];
  platforms.forEach((platform): void => runTaskOnPlatform(platform));
} else {
  runTaskOnPlatform(os.platform());
}
