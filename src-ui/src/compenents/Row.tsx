import React, { FC } from "react";
import { RowModel, StoreModel } from "src/models";
import { ACTION_NAME } from "src/utils/reducer";
import styled from "styled-components";
import Button from "./Button";
import { Icon } from "./Icon";
import Select from "./Select";
import { ICONS } from "src/utils/iconsData";
import { ROW_SIZE } from "src/constants";
import { CMItemModel } from "src/utils/contextMenuHook";

interface TileRowModel{
  store: StoreModel
  row: RowModel
}

const TileRowStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  tranition: var(--transition);
  border-radius: var(--radius);
  margin: 0.2em;
  border-width 0.2em;
  border-style: solid;
  --row-color: var(--gray);
  overflow: hidden;
  &.online:not(.busy){
    --row-color: var(--green);
  }
  &.timeout:not(.busy), &.error:not(.busy){
    --row-color: var(--red);
  }
  
  &.paused{
    --row-color: var(--gray);
    background-image: repeating-linear-gradient(45deg, var(--row-color) 0, var(--row-color) 2px, transparent 0, transparent 16px);
    opacity: 0.7;
  }

  &.busy{
    --row-color: transparent;
  }

  border-color: var(--row-color);
  
  

  &.size${ROW_SIZE.x1}{
    grid-column: span 1;
    grid-row: span 1;
  }
  &.size${ROW_SIZE.x2v}{
      grid-column: span 2;
      grid-row: span 1;
  }
  &.size${ROW_SIZE.x2h}{
    grid-column: span 1;
    grid-row: span 2;
  }
  &.size${ROW_SIZE.x4}{
      grid-column: span 2;
      grid-row: span 2;
  }
  &.size${ROW_SIZE.x6}{
      grid-column: span 3;
      grid-row: span 2;
  }
`;

export const TileRow: FC<TileRowModel> = ({store, row}) => {
  const handleDelete = () => {
    store.dispatch({
      name: ACTION_NAME.ROWS_REMOVE,
      payload: [row.id]
    });
  };
  const handleChange = (prop: keyof RowModel, newVal: string | boolean) => {
    store.dispatch({
      name: ACTION_NAME.ROWS_SET_PARAM,
      payload: {
        rowsId: [row.id],
        param: prop,
        value: newVal
      }
    });
  };
  const picOptions = Object.keys(ICONS).filter(pic => pic.includes("pic_")).map(pic => {
    return {
      label: pic,
      value: pic
    };
  });
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const top = e.pageY;
    const left = e.pageX;
    const playButton = row.isPaused ? {
      label: "contextMenuPlay",
      icon: "ico_play",
      onClick: () => {
        handleChange("isPaused", false);
      }
    } as CMItemModel : {
      label: "contextMenuPause",
      icon: "ico_pause",
      onClick: () => {
        handleChange("isPaused", true);
      }
    } as CMItemModel;
    const muteButton = row.isMuted ? {
      label: "contextMenuUnmute",
      icon: "ico_soundOn",
      onClick: () => {
        handleChange("isMuted", false);
      }
    } as CMItemModel : {
      label: "contextMenuMute",
      icon: "ico_soundOff",
      onClick: () => {
        handleChange("isMuted", true);
      }
    } as CMItemModel;
    store.showContextMenu(top, left, [
      playButton,
      muteButton,
      {
        label: "contextMenuRemove",
        icon: "ico_trash",
        onClick: () => {
          handleDelete();
        }
      }
    ]);
  };
  return <TileRowStyle
    className={`row tileRow bc ${row.lastPing.status} size${row.size} ${row.isPaused ? " paused" : ""} ${row.isBusy ? " busy" : ""}`}
    onContextMenu={handleContextMenu}
  >
    <Icon icon={row.picture} css={{width:"8em"}} />
    {row.lastPing.status}
    {row.isMuted}
    {row.isPaused}
  </TileRowStyle>;
};