import React from "react";
import { render } from "react-dom";
import { Router } from "react-router-static";
import LogViewer from "./LogViewer";
import PacEditor from "./PacEditor";
import ConfigEditor from "./ConfigEditor";
import Error404 from "./Error404";

const routes = {
  default: Error404,
  logViewer: LogViewer,
  pacEditor: PacEditor,
  configEditor: ConfigEditor
};

render(<Router routes={routes} />, document.getElementById("app"));
