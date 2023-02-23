import React, { FC, useEffect, useRef } from "react";
import styled from "styled-components";
import { ActionType, StateModel, StoreModel } from "src/models";
import { customHook } from "src/utils/customHook";
import { LANG_CODE, getT } from "src/utils/lang";
import Toast from "./Toast";
import Alert from "./Alert";
import { Menu } from "./Menu";
import Prompt from "./Prompt";
import { ConfigModal } from "./ConfigModal";
import { getConfig } from "src/utils/config";
import { View } from "./View";
import { ACTION_NAME } from "src/utils/reducer";
import { ContextMenu } from "./ContextMenu";
import { contextMenuHook } from "src/utils/contextMenuHook";
import { RowEditModal } from "./RowEditModal";
import { appWindow } from "@tauri-apps/api/window";

interface AppInterface {
  state: StateModel
  dispatch: (action: ActionType) => void
}

const AppStyle = styled.div`
  user-select: none;
  &:not(:focus-within) .toolItem{
    opacity: 0;
    visibility: hidden;
    transform: scale(0.7);
  }
  :hover .toolItem, :hover .sliderBlock, :hover .datePicker{
    opacity: 1;
    visibility: visible;
    transform: scale(1);
  }
  :hover .sliderBlock, :hover .datePicker{
    opacity: 1;
    visibility: visible;
    transform: translate(0);
  }
`; 

const App: FC<AppInterface> = ({state, dispatch}) => {
  const firstTime = useRef(true);
  useEffect(() => {
    //first render sett all rows to not busy
    if(firstTime.current) {
      dispatch({
        name: ACTION_NAME.ROWS_SET_PARAM,
        payload: {
          rowsId: state.rows.map(row => row.id),
          param: "isBusy",
          value: false
        }
      });
      firstTime.current = false;
    }
    const zero = 0;
    const audio = (document.querySelector("#siren") as HTMLAudioElement);
    if(state.rows.filter(row => row.isAlarmed).length > zero) {
      audio.paused ? audio.play() : null;
    }else{
      !audio.paused ? audio.pause() : null;
    }
    //hotkeys
    const handleKeyDown = (e: KeyboardEvent) => {
      if(["Equal", "Minus", "Digit0"].includes(e.code) && e.ctrlKey) { 
        e.preventDefault();
        const speed = 10;
        const defaultZoom = 100;
        const newZoom  = e.code === "Digit0" ? defaultZoom : e.code === "Equal" ? state.zoom + speed : state.zoom - speed;
        store.dispatch({
          name: ACTION_NAME.APP_SET_ZOOM,
          payload: newZoom
        });
      }
      if(e.code === "KeyA" && e.ctrlKey) { 
        const isAllSelected = store.state.rows.filter(row => !row.isSelected).length === zero;
        store.dispatch({
          name: ACTION_NAME.ROWS_SET_PARAM,
          payload: {
            rowsId: store.state.rows.map(row => row.id),
            param: "isSelected",
            value: !isAllSelected
          }
        });
      }
      if(e.code === "KeyF" && e.ctrlKey) {
        e.preventDefault();
        appWindow.isFullscreen().then((isFullscreen) => {
          appWindow.setFullscreen(!isFullscreen);
        });
      }
    };
    //closing context menu
    const handleMouseUp = (e: MouseEvent) => {
      const target = (e.target as HTMLElement);
      const parent1 = target?.parentElement || null;
      const parent2 = parent1?.parentElement || null;
      const parent3 = parent2?.parentElement || null;
      const parent4 = parent3?.parentElement || null;
      const hasClass: (node: HTMLElement | null, classes: string) => boolean = (node, classes) => {
        if(!node || typeof node?.className !== "string") {
          return false;
        }
        return node.className.includes(classes) || false;
      };
      //hiding contextmenu
      const isContextMenuItself = hasClass(target, "contextMenuItem") || hasClass(parent1, "contextMenuItem") || hasClass(parent2, "contextMenuItem") || hasClass(parent3, "contextMenuItem") || hasClass(parent4, "contextMenuItem");
      if(contextMenuData.isShown && !isContextMenuItself) {
        store.hideContextMenu();
      }
      //unselecting all rows
      const isViewClicked = hasClass(target, "view");
      if(isViewClicked) {
        store.dispatch({
          name: ACTION_NAME.ROWS_SET_PARAM,
          payload: {
            rowsId: state.rows.filter(row => row.isSelected).map(row => row.id),
            param: "isSelected",
            value: false
          }
        });
      }
    };
    const handleContextMenu = (e:MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("keydown", handleKeyDown, {passive: false});
    document.addEventListener("mouseup", handleMouseUp, {passive: false});
    document.addEventListener("contextmenu", handleContextMenu, {passive: false});
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  });
  const {toastData, showToast, alertData, showAlert, promptData, showPrompt} = customHook();
  const {contextMenuData, showContextMenu, hideContextMenu} = contextMenuHook();
  const config = getConfig();
  const store: StoreModel = {
    state: state,
    config: config,
    t: getT(config.language || LANG_CODE.en),
    dispatch, 
    showToast,
    showAlert,
    showPrompt,
    showContextMenu,
    hideContextMenu
  };
  const appZoomStyle = {"--zoom": state.zoom} as React.CSSProperties;
  return <AppStyle style={appZoomStyle}>
    <View store={store}/>
    <ContextMenu store={store} data={contextMenuData} />
    <Menu store={store}/>
    <RowEditModal store={store} />
    <ConfigModal store={store} />
    <Prompt 
      isShown={promptData.isShown}
      header={promptData.header}
      text={promptData.text}
      type={promptData.type}
      oncancel={promptData.oncancel}
      onconfirm={promptData.onconfirm}
      t={getT(config.language || LANG_CODE.en)}
      confirmButtonTitle={promptData.confirmButtonTitle}
      options={promptData.options} 
    />
    {alertData.isShown &&
    <Alert 
      isShown={alertData.isShown}
      header={alertData.header}
      text={alertData.text}
      oncancel={alertData.oncancel}
      onconfirm={alertData.onconfirm}
    />}
    <Toast
      isShown={toastData.isShown}
      text={toastData.text}
      icon={toastData.icon}
    />
  </AppStyle>;
};

export default App;