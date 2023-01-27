import React from "react";
import { createRoot } from "react-dom/client";
import App from "./compenents/app";
import stateManager from "./utils/stateManager";

const root = createRoot(document.querySelector(".root") as HTMLElement);
root.render(<App state={stateManager.getState()} dispatch={stateManager.dispach}></App>);
stateManager.subscribe((state) => {
  root.render(<App state={state} dispatch={stateManager.dispach}></App>);
});