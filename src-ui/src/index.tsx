import React from "react";
import { createRoot } from "react-dom/client";
import App from "./compenents/app";
import stateManager from "./utils/stateManager";


const root = createRoot(document.querySelector(".root") as HTMLElement);
try{
  const stateNow = stateManager.getState();
  root.render(<App state={stateNow} dispatch={stateManager.dispach}></App>);
  stateManager.subscribe((state) => {
    root.render(<App state={state} dispatch={stateManager.dispach}></App>);
  });
} catch (e) {
  const r = document.querySelector(".root");
  if(r) {
    r.innerHTML = "Critical error";
    // localStorage.clear();
  }
  null;
}