import React, { useState, useCallback, useEffect } from "react";
import fs from "fs";
import { remote, ipcRenderer } from "electron";
import AceEditor from "react-ace";
import path from "path";
import * as os from "os";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

import "brace/mode/json";
import "brace/theme/github";

let configPath = path.join(remote.app.getPath("userData"), "v2ray.json");
let defaultConfigPath = path.join(
  __dirname,
  "..",
  "..",
  "assets",
  "v2ray",
  `v2ray-${os.platform() === "win32" ? "win" : "macos"}`,
  "config.json.default"
);

const ConfigEditor: React.FC = () => {
  const [pac, setPac] = useState<string>();
  const onChange = useCallback(value => {
    setPac(value);
  }, []);
  const loadDefault = useCallback(() => {
    fs.readFile(defaultConfigPath, "utf-8", (err, data) => {
      setPac(data);
    });
  }, []);
  const save = useCallback(() => {
    fs.writeFileSync(configPath, pac);
    ipcRenderer.send("restart");
  }, [pac]);
  useEffect(() => {
    fs.readFile(configPath, "utf-8", (err, data) => {
      setPac(data);
    });
  }, []);
  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={loadDefault}>
            Load Default
          </Button>
          <Button color="inherit" onClick={save}>
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <AceEditor
        mode="json"
        theme="github"
        onChange={onChange}
        value={pac}
      />
    </Container>
  );
};

export default ConfigEditor;
