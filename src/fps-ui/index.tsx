import React from "react";
import ReactDOM from "react-dom/client";
import { Ui } from "./ui";

export function renderUi() {
  ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
    <Ui />
  );
}
