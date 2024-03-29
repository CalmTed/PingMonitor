import React, { FC } from "react";
import { StateModel, StoreModel } from "src/models";
import { Word } from "src/utils/lang";
import styled from "styled-components";
import { Icon, IconName } from "./Icon";
import { ACTION_NAME } from "src/utils/reducer";
import { appWindow } from "@tauri-apps/api/window";
import { EXPORT_TYPE, IMPORT_TYPE, LAST_UPDATE, ONE, PROMPT_TYPES, VERSION } from "src/constants";
import {  exportData, importData } from "src/utils/importExport";
import {  ConfigModel, importConfig } from "src/utils/config";

interface MenuComponentModel{
  store: StoreModel
  isTabable: boolean
}


const MenuStyle = styled.div`
  .menuButton:focus + .menuList, .menuList:focus-within{
    top: 1em;
    visibility: visible;
    opacity: 1;
  }
  &.horizontal .menuButton:focus + .menuList, &.horizontal .menuList:focus-within{
    top: 5em;
    left: 0.5em;
  }
  top: 0;
  left: 0;
  position: fixed;
  display: flex;
  flex-wrap: wrap;
  width: 4em;
  &.horizontal{
    flex-wrap: nowrap;
  }
`;

export const Menu: FC<MenuComponentModel> = ({store, isTabable}) => {
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
  const handleUnalarmAll = () => {
    store.dispatch({
      name: ACTION_NAME.ROWS_SET_PARAM,
      payload: {
        rowsId: store.state.rows.filter(row => row.isAlarmed).map(row => row.id),
        param: "isAlarmed",
        value: false
      }
    });
  };
  const handleExport = () => {
    const exportOptions = [
      {
        label: store.t("optionState"),
        value: EXPORT_TYPE.rowsState
      },
      {
        label: store.t("optionConfig"),
        value: EXPORT_TYPE.config
      },
      {
        label: store.t("optionHistJSON"),
        value: EXPORT_TYPE.historyInJSON
      }
    ];
    store.showPrompt(store.t("promptWhatDoYouWhantToExport"), "", PROMPT_TYPES.select, () => { null; }, (ret) => { 
      exportData(store, ret as EXPORT_TYPE).then((isExported) => {
        if(isExported) {
          store.showToast(store.t("toastExported"), "ico_export");
        }else{
          store.showToast(store.t("toastExportError"), "ico_export");
        }
      });
    }, undefined, exportOptions);
  };
  const handleImport = () => {
    const importOptions = [
      {
        label: store.t("optionState"),
        value: IMPORT_TYPE.rowsState
      },
      {
        label: store.t("optionConfig"),
        value: IMPORT_TYPE.config
      }
    ];
    store.showPrompt(store.t("promptWhatDoYouWhantToImport"), "", PROMPT_TYPES.select, () => { null; }, (ret) => { 
      importData(store, ret as IMPORT_TYPE).then((result) => {
        if(!result) {
          store.showToast(store.t("toastImportError"), "ico_import");
        }
        if(ret === IMPORT_TYPE.rowsState) {
          store.dispatch({
            name: ACTION_NAME.APP_IMPORT_STATE,
            payload: result as StateModel
          });
          store.showToast(store.t("toastStateImported"), "ico_import");
        }
        if(ret === IMPORT_TYPE.config) {
          importConfig(result as ConfigModel);
          store.showToast(store.t("toastConfigImported"), "ico_import");
        }
      });
    }, undefined, importOptions);
  };
  const handleShowCopyright = () => {
    store.showAlert(`${store.t("copyrightName")} ${VERSION} ${LAST_UPDATE}`, `${store.t("copyrightText")} https://github.com/CalmTed/PingMonitor/releases/`, () => { null; }, () => { null; });
  };
  const menuTabIndex: number | undefined = isTabable ? ONE : undefined;
  return <MenuStyle className="horizontal">
    <ToolItem store={store} icon="ico_menu" title="titleMenu" classes="menuButton" onClick={() => { return; }} tabIndex={menuTabIndex}/>
    <MenuList>
      <MenuItem store={store} icon="ico_settings" name="menuItemSettings" title="titleSettings" onClick={handleOpenConfig} tabIndex={menuTabIndex}></MenuItem>
      <MenuItem store={store} icon="ico_export" name="menuItemExport" title="titleExport" onClick={handleExport} tabIndex={menuTabIndex}></MenuItem>
      <MenuItem store={store} icon="ico_import" name="menuItemImport" title="titleImport" onClick={handleImport} tabIndex={menuTabIndex}></MenuItem>
      <MenuItem store={store} icon="pic_pingMonitor" name="menuItemAbout" title="titleAbout" onClick={handleShowCopyright} tabIndex={menuTabIndex}></MenuItem>

    </MenuList>
    <ToolItem store={store} icon="ico_plus" title="titleAdd" onClick={handleAddRow} tabIndex={menuTabIndex}></ToolItem>
    <ToolItem store={store} icon="ico_fullscreen" title="titleFullscreen" onClick={handleFullscreen} tabIndex={menuTabIndex}></ToolItem>
    {
      String(store.state.rows.filter(row => row.isPaused === false).length) !== "0" && 
      <ToolItem store={store} icon="ico_pause" title="titlePauseAll" onClick={handlePauseAll} tabIndex={menuTabIndex}></ToolItem>
    }
    {
      String(store.state.rows.filter(row => row.isAlarmed === true).length) !== "0" && 
      <ToolItem store={store} icon="ico_alarmOff" title="titleUnalarmAll" onClick={handleUnalarmAll} tabIndex={menuTabIndex}></ToolItem>
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
  tabIndex?: number
}

const ToolItemStyle = styled.div`
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;
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

export const ToolItem: FC<ToolItemComponentModel> = ({store, icon, title, onClick, disabled, classes, tabIndex}) => {
  const handleEnterKey = (e: React.KeyboardEvent) => {
    if(e.code === "Enter") {
      (e.target as HTMLElement).click();
    }
  };
  return <ToolItemStyle 
    className={`bc toolItem${disabled ? " disabled" : ""}${classes ? " " + classes : ""}`}
    title={store.t(title)}
    onClick={() => { disabled ? null : onClick(); }}
    onKeyUp={handleEnterKey}
    tabIndex={tabIndex}
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
  tabIndex?: number
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
  :focus{
    outline-offset: -0.2em;
  }
`;

export const MenuItem: FC<MIProps> = ({store, name, icon, title, onClick, tabIndex}) => {
  const handleEnterKey = (e: React.KeyboardEvent) => {
    if(e.code === "Enter") {
      (e.target as HTMLElement).click();
    }
  };
  return <MenuItemStyle
    className="bc"
    onClick={onClick}
    title={store.t(title)}
    tabIndex={tabIndex}
    onKeyUp={handleEnterKey}
  >
    <Icon icon={icon}/>&nbsp;{store.t(name)}
  </MenuItemStyle>;
};