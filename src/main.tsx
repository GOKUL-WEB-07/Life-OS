import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/responsive.css";

import "./styles/life.css";
import "./styles/cinema.css";
if (!localStorage.getItem("life-os-design-v1")) {
  localStorage.setItem("project-os-theme", "dark");
  localStorage.setItem("life-os-design-v1", "1");
}
document.documentElement.dataset.theme =
  localStorage.getItem("project-os-theme") || "dark";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
