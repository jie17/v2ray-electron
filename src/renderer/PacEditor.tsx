import React, { useState, useCallback, useEffect } from "react";
import fs from "fs";
import { remote, ipcRenderer } from "electron";
import AceEditor from "react-ace";
import path from "path";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import isDev from "electron-is-dev";

import "brace/mode/javascript";
import "brace/theme/github";

let configPath = path.join(remote.app.getPath("userData"), "proxy.pac");
const root = isDev ? path.join(__dirname, "..", "..") : path.join(__dirname);
let defaultConfigPath = path.join(root, "assets", "proxy.pac.default");

const PacEditor: React.FC = () => {
  const [pac, setPac] = useState<string>("");
  const onChange = useCallback((value) => {
    setPac(value);
  }, []);
  const loadDefault = useCallback(() => {
    fs.readFile(defaultConfigPath, "utf-8", (err, data) => {
      setPac(data);
    });
  }, []);
  const save = useCallback(() => {
    fs.writeFileSync(configPath, pac);
    ipcRenderer.send("reset pac");
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
        mode="javascript"
        theme="github"
        onChange={onChange}
        value={pac}
      />
    </Container>
  );
};

export default PacEditor;
