import React, { FC } from "react";
import { RowModel, StoreModel } from "src/models";
import { ACTION_NAME } from "src/utils/reducer";
import styled from "styled-components";
import { Icon } from "./Icon";
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
  justify-items: center; 
  tranition: var(--transition);
  border-radius: var(--radius);
  margin: 0.2em;
  border-width 0.2em;
  border-style: solid;
  overflow: hidden;
  background-color: var(--bg-color);
  --row-color: var(--gray);
  &.online:not(.busy){
    --row-color: var(--green);
  }
  &.timeout:not(.busy), &.error:not(.busy){
    --row-color: var(--red);
  }
  
  &.paused.busy, &.paused:not(.busy){
    --row-color: var(--gray);
    background-image: repeating-linear-gradient(45deg, var(--row-color) 0, var(--row-color) 2px, transparent 0, transparent 16px);
    opacity: 0.9;
    .status{
      color: var(--text-color);
    }
  }

  &.busy{
    --row-color: transparent;
  }

  border-color: var(--row-color);
  
  &.size${ROW_SIZE.x1}{
    grid-column: span 1;
    grid-row: span 1;
    .rowPart1{
      width: 100%;
      height: 100%;
    }
  }
  &.size${ROW_SIZE.x2v}{
    grid-column: span 1;
    grid-row: span 2;
    .rowPart1,.rowPart2{
      width: 100%;
      height: 50%;
    }
  }
  &.size${ROW_SIZE.x2h}{
    grid-column: span 2;
    grid-row: span 1;
    .rowPart1,.rowPart2{
      width: 50%;
      height: 100%;
    }
  }
  &.size${ROW_SIZE.x4}{
      grid-column: span 2;
      grid-row: span 2;
      .rowPart1,.rowPart2{
        width: 50%;
        height: 50%;
      }
      .rowPart3{
        width: 100%;
        height: 50%;
      }
  }
  &.size${ROW_SIZE.x6}{
      grid-column: span 3;
      grid-row: span 2;
      .rowPart1,.rowPart2,.rowPart4{
        width: 33%;
        height: 50%;
      }
      .rowPart3{
        width: 100%;
        height: 50%;
      }
  }
  .rowPart1{
    display: flex;
    flex-wrap: wrap;
    align-content: space-evenly;
    justify-content: center;
    .label{
      margin-top: 0.5em;
      text-align: center;
      width: 100%;
      text-transform: uppercase;
    }
    .address{
      width: 100%;
      text-align: center;
      opacity: 0.6;
    }
  }
  .rowPart2,.rowPart3,.rowPart4{
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    .status{
      padding: 0.7em 1em;
      border-radius: var(--radius);
      text-transform: uppercase;
      border: 0.2em solid var(--row-color);
      background: var(--bg-color);
      // color: var(--row-color);
    }
    .dellay{
      width: 100%;
      text-align: center;
      margin-top: 1.4em;
    }
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
    const editButton = {
      label: "contextMenuEdit",
      icon: "ico_settings",
      onClick: () => {
        store.dispatch({
          name: ACTION_NAME.ROWS_TOGGLE_EDIT,
          payload: [row.id]
        });
      }
    } as CMItemModel;
    store.showContextMenu(top, left, [
      playButton,
      editButton,
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
    className={`row tileRow ${row.lastPing.status} size${row.size}${row.isPaused ? " paused" : ""} ${row.isBusy ? " busy" : ""}`}
    onContextMenu={handleContextMenu}
  >
    <div className="rowPart1">
      <Icon icon={row.picture} css={{width:"8em"}} />
      <span className="label">{row.label}</span>
      <span className="address">{store.config.hideAddress ? null : row.address}</span>
    </div>
    { row.size !== ROW_SIZE.x1 && 
      <div className="rowPart2">
        <span className={`status ${row.lastPing.status}`}>{row.lastPing.status}</span>
        <span className="dellay">{row.lastPing.avgDellay} {store.t("ms")}</span>
      </div>
    }
    { row.size === ROW_SIZE.x6 && 
      <div className="rowPart4">
        <span className={`status ${row.lastPing.status}`}>{row.lastPing.status}</span>
        <span className="dellay">{row.lastPing.avgDellay} {store.t("ms")}</span>
      </div>
    }
    { ![ROW_SIZE.x1, ROW_SIZE.x2v, ROW_SIZE.x2h].includes(row.size) && 
      <div className="rowPart3">
        <span className={`status ${row.lastPing.status}`}>{row.lastPing.status}</span>
        <span className="dellay">{row.lastPing.avgDellay} {store.t("ms")}</span>
      </div>
    }
    
  </TileRowStyle>;
};