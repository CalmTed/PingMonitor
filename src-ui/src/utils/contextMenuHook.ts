import { useState } from "react";
import { IconName } from "src/compenents/Icon";
import { Word } from "./lang";


export interface CMItemModel{
  label: Word
  icon?: IconName
  onClick: () => void
}

export interface CMDataModel{
  isShown: boolean,
  top: number,
  left: number,
  items: CMItemModel[]
}

export const contextMenuHook = () => {
  const [contextMenuData, setContextMenuData] = useState({
    isShown: false,
    top: 0,
    left: 0,
    items: []
  } as CMDataModel);
  
  const hideContextMenu = () => {
    setContextMenuData({
      isShown: false,
      top: contextMenuData.top,
      left: contextMenuData.left,
      items: []
    });
  };
  const showContextMenu = (top: number, left: number, items: CMItemModel[]) => {
    setContextMenuData({
      isShown: true,
      top,
      left,
      items
    });
  };
  return {
    showContextMenu,
    hideContextMenu,
    contextMenuData
  };
};