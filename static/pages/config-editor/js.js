import loader from "monaco-loader";
import fs from "fs";
import { remote, ipcRenderer } from "electron";
import path from "path";
import Store from "electron-store";

global.ROOT = path.join(__dirname, "..", "..", "..");
vex.defaultOptions.className = "vex-theme-default";
const store = new Store();
const V2RAY_PROFILE = "v2ray-profiles";
let editor = null;
let configPath = path.join(remote.app.getPath("userData"), "v2ray.json");
let defaultConfigPath = path.join(
  global.ROOT,
  "assets",
  "v2ray",
  "config.json.default"
);

function loadProfiles() {
  let select = document.querySelector(".profiles");
  select.innerHTML = "";
  let profiles = store.get(V2RAY_PROFILE);
  if (!profiles) {
    profiles = [];
    store.set("profiles", profiles);
  }
  profiles.forEach((profile, index) => {
    let option = document.createElement("option");
    option.text = profile.name + (profile.active ? " [Active]" : "");
    option.value = index;
    select.appendChild(option);
  });
  return profiles && profiles.length;
}

function loadDataToEditor(data) {
  editor.setModel(this.monaco.editor.createModel(data, "json"));
}

function showProfile(index) {
  let profiles = store.get(V2RAY_PROFILE);
  loadDataToEditor(profiles[index].value);
}

function readProfileFromEditor() {
  const model = editor.getModel();
  let data = "";

  model._lines.forEach(line => {
    data += line.text + model._EOL;
  });

  return data;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveProfile() {
  let data = readProfileFromEditor();
  let profiles = store.get(V2RAY_PROFILE);
  let index = document.querySelector(".profiles").value;
  profiles[index].value = data;
  store.set(V2RAY_PROFILE, profiles);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function loadDefault() {
  fs.readFile(defaultConfigPath, "utf-8", (err, data) => {
    loadDataToEditor(data);
  });
}

document.querySelector(".create-profile").addEventListener("click", () => {
  if (!store.get(V2RAY_PROFILE)) {
    store.set(V2RAY_PROFILE, []);
  }
  vex.dialog.prompt({
    message: "Enter new name",
    callback: function(value) {
      if (value) {
        let profiles = store.get(V2RAY_PROFILE);
        let profile = {};
        profile.name = value;
        profile.value = "";
        profiles.push(profile);
        store.set(V2RAY_PROFILE, profiles);
        loadProfiles(profiles.length - 1);
      }
    }
  });
});

document.querySelector(".rename-profile").addEventListener("click", () => {
  vex.dialog.prompt({
    message: "Enter new name",
    callback: function(value) {
      if (value) {
        let profiles = store.get(V2RAY_PROFILE);
        let index = document.querySelector(".profiles").value;
        profiles[index].name = value;
        store.set(V2RAY_PROFILE, profiles);
        loadProfiles(index);
      }
    }
  });
});

loader().then(monaco => {
  editor = monaco.editor.create(document.getElementById("container"), {
    language: "json",
    theme: "vs",
    automaticLayout: true
  });

  let number = loadProfiles();
  if (number) {
    showProfile(0);
  }
});

document.querySelector(".delete-profile").addEventListener("click", () => {
  vex.dialog.confirm({
    message: "Delete",
    callback: function() {
      let profiles = store.get(V2RAY_PROFILE);
      let index = document.querySelector(".profiles").value;
      profiles.splice(index, 1);
      store.set(V2RAY_PROFILE, profiles);
      loadProfiles();
    }
  });
});

document.querySelector(".use-profile").addEventListener("click", () => {
  let data = readProfileFromEditor();
  fs.writeFileSync(configPath, data, "utf-8");
  let profiles = store.get(V2RAY_PROFILE);
  let index = document.querySelector(".profiles").value;
  profiles = profiles.map((p, i) => Object.assign(p, { active: i == index }));
  store.set(V2RAY_PROFILE, profiles);
  loadProfiles();
  document.querySelector(".profiles").value = index;
  ipcRenderer.send("restart");
});

document.querySelector(".profiles").addEventListener("change", event => {
  showProfile(event.target.value);
});
