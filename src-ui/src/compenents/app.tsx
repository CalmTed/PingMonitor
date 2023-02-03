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

interface AppInterface {
  state: StateModel
  dispatch: (action: ActionType) => void
}

const AppStyle = styled.div`
  &:not(:focus-within) .toolItem{
    opacity: 0;
    visibility: hidden;
    transform: scale(0.7);
  }
  :hover .toolItem{
    opacity: 1;
    visibility: visible;
    transform: scale(1);
  }
`; 

const App: FC<AppInterface> = ({state, dispatch}) => {
  //first render sett all rows to not busy
  const firstTime = useRef(true);
  //hotkeys
  useEffect(() => {
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
    };
    const handleMouseUp = (e: MouseEvent) => {
      const target = (e.target as HTMLElement);
      const parent1 = target?.parentElement || null;
      const parent2 = parent1?.parentElement || null;
      const parent3 = parent2?.parentElement || null;
      const parent4 = parent3?.parentElement || null;
      const hasClass: (node: HTMLElement | null) => boolean = (node) => {
        if(!node || typeof node?.className !== "string") {
          return false;
        }
        return node.className.includes("contextMenuItem") || false;
      };
      const isContextMenuItself = hasClass(target) || hasClass(parent1) || hasClass(parent2) || hasClass(parent3) || hasClass(parent4);
      if(contextMenuData.isShown && !isContextMenuItself) {
        store.hideContextMenu();
      }
    };
    document.addEventListener("keydown", handleKeyDown, {passive: false});
    document.addEventListener("mouseup", handleMouseUp, {passive: false});
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
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