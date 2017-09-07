const loader = require('monaco-loader')
const fs = require('fs')
const {process, remote, ipcRenderer} = require('electron')
const path = require('path')
const Store = require('electron-store')

global.ROOT = path.join(__dirname, '..', '..', '..')
vex.registerPlugin(require('vex-dialog'))
vex.defaultOptions.className = 'vex-theme-default'
const store = new Store()
let editor = null
let configPath = path.join(remote.app.getPath('userData'), "v2ray.json")
let defaultConfigPath = path.join(global.ROOT, 'assets', 'v2ray', 'config.json.default')

loader().then((monaco) => {
  editor = monaco.editor.create(document.getElementById('container'), {
    language: 'json',
    theme: 'vs',
    automaticLayout: true
  })
  
  let number = loadProfiles()
  if (number) {
    showProfile(0)
  }
})

function loadProfiles() {
  let select = document.querySelector(".profiles")
  select.innerHTML = ""
  let profiles = store.get("v2ray-profiles")
  profiles.forEach((profile, index) => {
    let option = document.createElement("option")
    option.text = profile.name
    option.value = index
    select.appendChild(option)
  })
  return profiles && profiles.length
}

function showProfile(index) {
  let profiles = store.get("v2ray-profiles")
  loadDataToEditor(profiles[index].value)
}

function loadDataToEditor(data) {
  editor.setModel(this.monaco.editor.createModel(data, 'json'));
}

function saveProfile() {
  let data = readProfileFromEditor()
  let profiles = store.get("v2ray-profiles")
  let index = document.querySelector(".profiles").value
  profiles[index].value = data
  store.set("v2ray-profiles", profiles)
}

function readProfileFromEditor() {
  const model = editor.getModel();
  let data = ''

  model._lines.forEach((line) => {
    data += line.text + model._EOL
  })

  return data
}

function loadDefault() {
  fs.readFile(defaultConfigPath, 'utf-8', (err, data) => {
    loadDataToEditor(data)
  })
}

document.querySelector(".create-profile").addEventListener("click", () => {
  if (!store.get("v2ray-profiles")) {
    store.set("v2ray-profiles", [])
  }
  vex.dialog.prompt({
    message: 'Enter new name',
    callback: function (value) {
      if (value) {
        let profiles = store.get("v2ray-profiles")
        let profile = {}
        profile.name = value
        profile.value = ""
        profiles.push(profile)
        store.set("v2ray-profiles", profiles)
        loadProfiles(profiles.length - 1)
      }
    }
  })
})

document.querySelector(".rename-profile").addEventListener("click", () => {
  vex.dialog.prompt({
    message: 'Enter new name',
    callback: function (value) {
      if (value) {
        let profiles = store.get("v2ray-profiles")
        let index = document.querySelector(".profiles").value
        profiles[index].name = value
        store.set("v2ray-profiles", profiles)
        loadProfiles(index)
      }
    }
  })
})

document.querySelector(".delete-profile").addEventListener("click", () => {
  vex.dialog.confirm({
    message: 'Delete',
    callback: function (value) {
      let profiles = store.get("v2ray-profiles")
      let index = document.querySelector(".profiles").value
      profiles.splice(index, 1)
      store.set("v2ray-profiles", profiles)
      loadProfiles()
    }
  })
})

document.querySelector(".use-profile").addEventListener("click", () => {
  let data = readProfileFromEditor()
  fs.writeFileSync(configPath, data, 'utf-8');
  ipcRenderer.send("restart")
})

document.querySelector(".profiles").addEventListener("change", event => {
  showProfile(event.target.value)
})