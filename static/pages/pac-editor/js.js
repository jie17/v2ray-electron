import loader from "monaco-loader";
import fs from "fs";
import { remote, ipcRenderer } from "electron";
import path from "path";

global.ROOT = path.join(__dirname, "..", "..", "..");

let editor = null;
let configPath = path.join(remote.app.getPath("userData"), "proxy.pac");
let defaultConfigPath = path.join(global.ROOT, "assets", "proxy.pac.default");

loader().then(monaco => {
  editor = monaco.editor.create(document.getElementById("container"), {
    language: "javascript",
    theme: "vs",
    automaticLayout: true
  });

  fs.readFile(configPath, "utf-8", (err, data) => {
    editor.setModel(this.monaco.editor.createModel(data, "javascript"));
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function save() {
  const model = editor.getModel();
  let data = "";

  model._lines.forEach(line => {
    data += line.text + model._EOL;
  });

  fs.writeFileSync(configPath, data, "utf-8");
  ipcRenderer.send("reset pac");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function loadDefault() {
  fs.readFile(defaultConfigPath, "utf-8", (err, data) => {
    editor.setModel(this.monaco.editor.createModel(data, "javascript"));
  });
}
