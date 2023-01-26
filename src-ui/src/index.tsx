
// import { invoke } from "@tauri-apps/api";
// import { appWindow } from "@tauri-apps/api/window";
import React from "react";
import { createRoot } from "react-dom/client";


const rootDom = document.querySelector(".root");
if(rootDom) {
  const root = createRoot(document.querySelector(".root")!);
  root.render(<div>Ping monitor 1.5</div>);
}else {
  console.error(rootDom);
}