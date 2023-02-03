import React, { FC } from "react";
import { StoreModel } from "src/models";
import { Word } from "src/utils/lang";
import styled from "styled-components";
import { Icon, IconName } from "./Icon";
import { ACTION_NAME } from "src/utils/reducer";
import { appWindow } from "@tauri-apps/api/window";

interface MenuComponentModel{
  store: StoreModel
}


const MenuStyle = styled.div`
  .menuButton:focus + .menuList, .menuList:focus-within{
    top: 1em;
    visibility: visible;
    opacity: 1;
  }
  top: 0;
  left: 0;
  position: fixed;
  display: flex;
  flex-wrap: wrap;
  width: 4em;
`;

export const Menu: FC<MenuComponentModel> = ({store}) => {
  const handleAddRow = () => {
    store.dispatch({
      name: ACTION_NAME.ROW_ADD
    });
  };
  const handleOpenConfig = () => {
    store.dispatch({
      name: ACTION_NAME.APP_SET_CONFIG_OPEN_STATE,
      payload: true
    });
  };
  
  const handleFullscreen = () => {
    appWindow.isFullscreen().then((isFullscreen) => {
      appWindow.setFullscreen(!isFullscreen);
    });
    // document.documentElement.requestFullscreen();
    // if (!document.fullscreenElement) {
    //   null;
    // } else if (document.exitFullscreen) {
    //   document.exitFullscreen();
    // }
  };
  const handlePauseAll = () => {
    store.dispatch({
      name: ACTION_NAME.ROWS_SET_PARAM,
      payload: {
        rowsId: store.state.rows.filter(row => !row.isPaused).map(row => row.id),
        param: "isPaused",
        value: true
      }
    });
  };
  return <MenuStyle>
    <ToolItem store={store} icon="ico_menu" title="titleMenu" classes="menuButton" onClick={() => { return; }}/>
    <MenuList>
      <MenuItem store={store} icon="ico_settings" name="menuItemSettings" title="titleSettings" onClick={handleOpenConfig}></MenuItem>
      <MenuItem store={store} icon="ico_export" name="menuItemExport" title="titleExport" onClick={() => { return; }}></MenuItem>
      <MenuItem store={store} icon="ico_import" name="menuItemImport" title="titleImport" onClick={() => { return; }}></MenuItem>

    </MenuList>
    <ToolItem store={store} icon="ico_plus" title="titleAdd" onClick={handleAddRow}></ToolItem>
    <ToolItem store={store} icon="ico_fullscreen" title="titleFullscreen" onClick={handleFullscreen}></ToolItem>
    {
      String(store.state.rows.filter(row => row.isPaused === false).length) !== "0" && 
      <ToolItem store={store} icon="ico_pause" title="titlePauseAll" onClick={handlePauseAll}></ToolItem>
    }
  </MenuStyle>;
};

interface ToolItemComponentModel{
  store: StoreModel
  icon: IconName
  title: Word
  onClick: () => void
  disabled?: boolean
  classes?: string
}

const ToolItemStyle = styled.div`
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  display: inline-block;
  margin: 0.2em;
  padding: 0.2em;
  border-radius: var(--radius);
  font-size: 3em;
  display: flex;
  align-items: center;
  justify-components: center;
  transition: var(--transition);
  .menuButton:focus{
    background: var(--bc-bg-hover);  
  }
  &:hover{
    background: var(--bc-bg-hover);
  }
`;

export const ToolItem: FC<ToolItemComponentModel> = ({store, icon, title, onClick, disabled, classes}) => {

  return <ToolItemStyle 
    className={`bc toolItem${disabled ? " disabled" : ""}${classes ? " " + classes : ""}`}
    title={store.t(title)}
    onClick={() => { disabled ? null : onClick(); }}
    tabIndex={1}
  >
    <Icon icon={icon} />
  </ToolItemStyle>;
};


type MLProps = {
  children?: React.ReactNode; 
};

const MenuListStyle = styled.div`
  position: fixed;
  top: -20em;
  left: 5em;
  transition: var(--transition);
  background: transparent;
  visibility: hidden;
  opacity: 0;
`;

export const MenuList: FC<MLProps> = ({children}) => {
  return <MenuListStyle className="menuList">
    {children}
  </MenuListStyle>;
};

type MIProps = {
  store: StoreModel
  name: Word
  icon: IconName
  title: Word
  onClick: () => void
};

const MenuItemStyle = styled.div`
  padding: 0.8em 1em;
  cursor: pointer;
  transition: var(--transition);
  align-items: center;
  display: flex;
  &:hover{
    cursor: pointer;
    background: var(--bc-bg-hover);
  }
  &:first-child{
    border-radius: var(--radius) var(--radius) 0 0;
  }
  &:last-child{
    border-radius: 0 0 var(--radius) var(--radius);
  }
`;

export const MenuItem: FC<MIProps> = ({store, name, icon, title, onClick}) => {
  return <MenuItemStyle
    className="bc"
    onClick={onClick}
    title={store.t(title)}
    tabIndex={1}
  >
    <Icon icon={icon}/>&nbsp;{store.t(name)}
  </MenuItemStyle>;
};