import React, { FC, useEffect } from "react";
import { RowModel, StoreModel } from "src/models";
import { ACTION_NAME } from "src/utils/reducer";
import styled from "styled-components";
import { Icon } from "./Icon";
import { HOST_STATE, ROW_SIZE } from "src/constants";
import { CMItemModel } from "src/utils/contextMenuHook";
import ping from "src/utils/ping";
import { readHistDay, writeHist } from "src/utils/history";

interface TileRowModel{
  store: StoreModel
  row: RowModel
}

const TileRowStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
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
    opacity: 0.9;
    .status{
      color: var(--text-color);
    }
  }

  &.paused, &.alarmed{
    background-image: repeating-linear-gradient(45deg, var(--row-color) 0, var(--row-color) 2px, transparent 0, transparent 16px);
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
  //INDACATOR

  .indicator{
    height: 1em;
    position: absolute;
    font-family: "Material Icons";
    background: var(--bg-color);
    border-radius: 50em;
    font-size: 2em;
    padding: 0.2em;
    border: 0.1em solid var(--row-color);
    margin-left: -0.23em;
    margin-top: -0.33em;
    transition: transform .2s ease;
    opacity: 0;
    transform: scale(0.8);
    .icon{
      width: 1em;
    }
  }
  &.alarmed .indicator, &.muted .indicator{
    opacity: 1;
    transform: scale(1);
  }
  //PARTS
  .rowPart1{
    display: flex;
    flex-wrap: wrap;
    align-content: space-evenly;
    justify-content: center;
    .icon{
      width: 7em;
    }
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
  const  hour = 3600, minute = 60, zero = 0, thausand = 1000;
  const checkTime = () => {
    if (row.isPaused) {
      return;
    }
    if (row.isBusy) {
      return;
    }
    const date = new Date();
    const dateString = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
    const updateTime = row.updateTimeStrategy[row.lastPing.status] / thausand;
    const t = date.getHours() * hour + date.getMinutes() * minute + date.getSeconds();
    const isZero = row.lastPing.time === zero;
    const isToday = dateString === row.lastPing.date || false;
    const timeLeft = (row.lastPing.time + updateTime - t) * thausand;
    if (timeLeft > zero && !isZero && isToday) {
      return timeLeft;
    }
    store.dispatch({
      name: ACTION_NAME.ROWS_SET_PARAM,
      payload: {
        rowsId: [row.id],
        param: "isBusy",
        value: true
      }
    });
    checkPing();
  };
  useEffect(() => {
    const timeleft = checkTime();
    let timeoutId: number | undefined;
    if(timeleft) {
      timeoutId = setTimeout(() => {
        checkTime();
      }, timeleft);
    }
    return () => {
      timeoutId ? clearTimeout(timeoutId) : null;
    };
  });
  const checkPing = async () => {
    const results = await ping(row.address);
    await writeHist({
      rowId: row.id,
      time: results.time,
      state: results.status,
      dellay: results.avgDellay,
      ttl: results.ttl
    });
    const hist = await readHistDay();
    const getLatStates:(hist: string[], tta: number) => [number, HOST_STATE][] = (hist, tta) => {
      //[tttt]sdddddttl
      //[[0, HOST_STATE.error]];
      const timeSubstrStart = 0, timeSubstrEnd = 8, stateSubstrStart = 8, stateSubstrEnd = 7;
      const d = new Date();
      const timeNow = d.getHours() * hour + d.getMinutes() * minute + d.getSeconds();
      return hist.map(histItem => {
        const hl = histItem.length;
        const time = parseInt(histItem.substring(timeSubstrStart, hl - timeSubstrEnd));
        const stateIndex = parseInt(histItem.substring(hl - stateSubstrStart, hl - stateSubstrEnd));
        const state = Object.keys(HOST_STATE)[stateIndex] as HOST_STATE;
        if(state !== HOST_STATE.online || time < timeNow - (tta / thausand)) {
          return undefined;
        }
        return [time, state];
      }).filter(item => typeof item !== "undefined") as [number, HOST_STATE][];
    };
    
    const rowHist = hist ? hist.data?.[hist.rowIds.indexOf(String(row.id))] || undefined : undefined;
    const lastOnlineStates = rowHist ? getLatStates(rowHist, store.config.timeToAlarm) : null;
    //filter last (timeToAlarm)s
    //left only online
    //if length > 0
    //then false
    //else true
    const isAlarmed = (lastOnlineStates && !row.isMuted) ? lastOnlineStates.length === zero : false;//alarm on non online more than config.timeToAlarm
    //unmute on getting online
    const isMuted = results.status === HOST_STATE.online && row.lastPing.status !== HOST_STATE.online && store.config.unmuteOnOnline;
    store.dispatch({
      name: ACTION_NAME.ROWS_REPORT_PING,
      payload: {
        rowId: row.id,
        result: results,
        isAlarmed: isAlarmed,
        isMuted: isMuted
      }
    });
  };
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
    const alarmButton = row.isAlarmed ? {
      label: "contextMenuUnalarm",
      icon: "ico_alarmOff",
      onClick: () => {
        handleChange("isAlarmed", false);
      }
    } as CMItemModel : null;
    store.showContextMenu(top, left, [
      alarmButton ? alarmButton : null,
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
    className={`row tileRow ${row.lastPing.status} size${row.size}${row.isPaused ? " paused" : ""}${row.isBusy ? " busy" : ""}${row.isAlarmed ? " alarmed" : ""}${row.isMuted ? " muted" : ""}`}
    onContextMenu={handleContextMenu}
  >
    <div className="indicator">
      { row.isAlarmed &&
        <Icon icon="ico_alarmOn" css={{"--icon-color": "var(--red)"} as React.CSSProperties}/>
      }
      { row.isMuted &&
        <Icon icon="ico_soundOff"/>
      }
      { row.isSelected &&
        <Icon icon="ico_checkmark"/>
      }
    </div>
    <div className="rowPart1">
      <Icon icon={row.picture} />
      <span className="label">{row.label}</span>
      <span className="address">{store.config.hideAddress ? null : row.address}</span>
    </div>
    { row.size !== ROW_SIZE.x1 && 
      <div className="rowPart2">
        <span className={`status ${row.lastPing.status}`}>{row.lastPing.status}</span>
        <span className="dellay">{row.lastPing.status === HOST_STATE.online ? row.lastPing.avgDellay : "-"} {store.t("ms")} / {row.updateTimeStrategy[row.lastPing.status] / thausand} {store.t("s")}</span>
      </div>
    }
    { row.size === ROW_SIZE.x6 && 
      <div className="rowPart4">
      </div>
    }
    { ![ROW_SIZE.x1, ROW_SIZE.x2v, ROW_SIZE.x2h].includes(row.size) && 
      <div className="rowPart3">
      </div>
    }
    
  </TileRowStyle>;
};