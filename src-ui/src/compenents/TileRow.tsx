import React, { FC, useEffect } from "react";
import { RowModel, StoreModel } from "src/models";
import { ACTION_NAME } from "src/utils/reducer";
import styled from "styled-components";
import { Icon } from "./Icon";
import { EIGHT, HOST_STATE, HOURinSECONDS, HUNDRED, MINUTEinSECONDS, ONE, ROW_SIZE, THAUSAND, ZERO } from "src/constants";
import { CMItemModel } from "src/utils/contextMenuHook";
import ping, { parseResultInterface } from "src/utils/ping";
import { writeHist } from "src/utils/history";
import { TileRowGraph } from "./RowGraph";
import { toReadibleDuration, toReadibleTime } from "src/utils/toReadible";

interface TileRowModel{
  store: StoreModel
  row: RowModel
  hist: string[]
}

const TileRowStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  transition: transform .2s ease;
  border-radius: var(--radius);
  margin: 0.2em;
  border-width 0.2em;
  border-style: solid;
  overflow: hidden;
  background-color: var(--bg-color);
  --row-color: var(--gray);
  &.online:not(.busy){
    // --row-color: var(--green);
    --row-color: var(--rowGroupColor);
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

  &.busy:not(.alarmed){
    --row-color: transparent;
  }
  &.busy.alarmed{
    border-style: dashed;
    --row-color: var(--red);
    .indicator{
      border-style: dashed;
    }
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
  &.size${ROW_SIZE.x3}{
    grid-column: span 3;
    grid-row: span 1;
    .rowPart1,.rowPart2,.rowPart4{
      width: 33%;
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
    min-height: 0.7em;
    min-width: 0.7em;
    position: absolute;
    font-family: "Material Icons";
    background: var(--bg-color);
    border-radius: 50em;
    font-size: 2em;
    padding: 0.2em;
    border: 0.1em solid var(--row-color);
    margin-left: -0.23em;
    margin-top: -0.33em;
    transition: transform .2s ease, margin .2s ease;
    opacity: 0;
    cursor: pointer;
    transform: scale(0.8);
    .icon{
      width: 1em;
    }
  }
  &:first-child:hover .indicator{
    margin-left: 1.7em;
  }
  &.alarmed .indicator, &.muted .indicator, &.selected .indicator, &:hover .indicator{
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
  & .rowPart2,& .rowPart3,& .rowPart4{
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
  & .rowPart3{
    --graph-red: var(--red);
    --graph-green: var(--rowGroupColor);
  }
  &.paused .rowPart3{
    --graph-red: var(--gray);
    --graph-green: var(--gray);
  }
  & .rowPart4{
    display: flex;
    flex-wrap: wrap;
    div{
      width: 100%;
    }
    .changesHist{
      margin-top: 1em;
      max-height: 4em;
      overflow: auto;
      width: 100%;
      displat: flex;
      flex-wrap: wrap;
      span{
        display: flex;
        width: 100%;
      }
    }
  }
`;

export const getRowMethods = (store: StoreModel, row: RowModel) => {
  const checkTime = () => {
    if (row.isPaused) {
      return;
    }
    if (row.isBusy) {
      return;
    }
    const date = new Date();
    const dateString = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
    const t = date.getHours() * HOURinSECONDS + date.getMinutes() * MINUTEinSECONDS + date.getSeconds();
    const lastPing = row.lastPings?.[row.lastPings.length - ONE] || {
      status: HOST_STATE.unchecked,
      address: "",
      time: 0,
      avgDellay: 0,
      ttl: 0,
      date: ""
    };
    const updateTime = row.updateTimeStrategy[lastPing.status] / THAUSAND;
    const isZero = lastPing.time === ZERO;
    const isToday = dateString === lastPing.date || false;
    const timeLeft = (lastPing.time + updateTime - t) * THAUSAND;
    if (timeLeft > ZERO && !isZero && isToday) {
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
  const checkPing = async () => {
    const results = await ping(row.address);
    await writeHist({
      rowId: row.id,
      time: results.time,
      state: results.status,
      dellay: results.avgDellay,
      ttl: results.ttl
    });
    // const hist = await readHistDay();
    const isNonOnlinePastLimit:(hist: parseResultInterface[], timeToActivate: number) => boolean = (hist, timeToActivate) => {
      if(hist.length === ZERO) {
        return false;   
      }

      // if there is hisrory older then TTA
      // and there are not even one online ping

      //IF there are no online reports in the last TTA limit 
      //AND first hist item as older then TTA limit
      //THEN true
      const d = new Date();
      const timeNow = d.getHours() * HOURinSECONDS + d.getMinutes() * MINUTEinSECONDS + d.getSeconds();
      const TTALimit = timeNow - (timeToActivate);
      const lastReports = hist.filter(item => item.time > TTALimit);
      const lastOnlineReports = lastReports.filter(item => item.status === HOST_STATE.online);
      const firstReportIsOlderThenTTA = hist[0].time < TTALimit;
      return !lastOnlineReports.length && lastReports.length > ZERO && firstReportIsOlderThenTTA ? true : false; 

    };
    const rowHist = row.lastPings;
    const isAlarmed = !row.isMuted && !row.isPaused && isNonOnlinePastLimit(rowHist, store.config.timeToAlarm) ? true : undefined;

    //unmute on getting online
    const isMuted = (
      row.isMuted
      && results.status === HOST_STATE.online 
      && (row.lastPings[row.lastPings.length - ONE]?.status || HOST_STATE.online) !== HOST_STATE.online 
      && store.config.unmuteOnOnline
    ) ? false : undefined;
    store.dispatch({
      name: ACTION_NAME.ROWS_REPORT_PING,
      payload: {
        rowId: row.id,
        result: results,
        timeToAlarmMS: store.config.timeToAlarm,
        isAlarmed: isAlarmed,
        isMuted: isMuted
      }
    });
  };
  const handleDelete = (rows = [row.id]) => {
    store.dispatch({
      name: ACTION_NAME.ROWS_REMOVE,
      payload: rows
    });
  };
  const handleChange = (prop: keyof RowModel, newVal: string | boolean, rows:number[] = [row.id]) => {
    store.dispatch({
      name: ACTION_NAME.ROWS_SET_PARAM,
      payload: {
        rowsId: rows,
        param: prop,
        value: newVal
      }
    });
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const top = e.pageY;
    const left = e.pageX;
    const selectedRows = store.state.rows.filter(row => row.isSelected).map(row => row.id);
    const targetRows = (selectedRows.length > ZERO && row.isSelected) ? selectedRows : [row.id];
    const playButton = row.isPaused ? {
      label: "contextMenuPlay",
      icon: "ico_play",
      onClick: () => {
        handleChange("isPaused", false, targetRows);
      }
    } as CMItemModel : {
      label: "contextMenuPause",
      icon: "ico_pause",
      onClick: () => {
        handleChange("isPaused", true, targetRows);
      }
    } as CMItemModel;
    const muteButton = row.isMuted ? {
      label: "contextMenuUnmute",
      icon: "ico_soundOn",
      onClick: () => {
        handleChange("isMuted", false, targetRows);
      }
    } as CMItemModel : {
      label: "contextMenuMute",
      icon: "ico_soundOff",
      onClick: () => {
        handleChange("isMuted", true, targetRows);
      }
    } as CMItemModel;
    const editButton = {
      label: "contextMenuEdit",
      icon: "ico_settings",
      onClick: () => {
        store.dispatch({
          name: ACTION_NAME.ROWS_TOGGLE_EDIT,
          payload: targetRows
        });
      }
    } as CMItemModel;
    const alarmButton = row.isAlarmed ? {
      label: "contextMenuUnalarm",
      icon: "ico_alarmOff",
      onClick: () => {
        handleChange("isAlarmed", false, targetRows);
      }
    } as CMItemModel : null;
    const selectButton = row.isSelected ? {
      label: "contextMenuUnselect",
      icon: "ico_checkmark",
      onClick: () => {
        handleChange("isSelected", false, [row.id]);  
      }
    } as CMItemModel : {
      label: "contextMenuSelect",
      icon: "ico_checkmark",
      onClick: () => {
        handleChange("isSelected", true, [row.id]);  
      }
    } as CMItemModel;
    store.showContextMenu(top, left, [
      alarmButton,
      playButton,
      editButton,
      muteButton,
      selectButton,
      {
        label: "contextMenuRemove",
        icon: "ico_trash",
        onClick: () => {
          handleDelete(targetRows);
        }
      }
    ]);
  };
  const toggleSelect = () => {
    handleChange("isSelected", !row.isSelected);
  };
  return {
    checkTime,
    checkPing,
    handleDelete,
    handleChange,
    handleContextMenu,
    toggleSelect,
    useEffect: () => {
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
    }
  };
};

export const TileRow: FC<TileRowModel> = ({store, row, hist}) => {
  const methods = getRowMethods(store, row);
  useEffect(methods.useEffect);
  
  const getStats = (hist: string[]) => {
    const ret = {
      stats: {
        [HOST_STATE.online]: 0,
        [HOST_STATE.error]: 0,
        [HOST_STATE.timeout]: 0,
        [HOST_STATE.unchecked]: 0
      },
      onlineRate: 0, //0-100
      hist: [] as {
        status: number
        time: number
        duration: number
      }[]
    };
    let statusNow: number;
    hist.map((item, i, arr) => {
      //[28759 0 0000 128]
      const timeStart = 0; //without length
      const timeEnd = 8;
      const statusStart = 8;
      const statusEnd = 7;
      
      const curLength = item.length;
      const curStatus = parseInt(item.slice(curLength - statusStart, curLength - statusEnd));
      //if first or last THEN skip
      if(i === ZERO) {
        //set statusNow
        statusNow = curStatus;
      }else{
        //get prev time & state
        const prv = arr[i - ONE];
        const prvLength = prv.length;
        const prvTime = parseInt(prv.slice(timeStart, prvLength - timeEnd));
        const prvStatus = parseInt(prv.slice(prvLength - statusStart, prvLength - statusEnd));
        const curTime = parseInt(item.slice(timeStart, prvLength - timeEnd));
        const diffTime = curTime - prvTime;
        //add diff of time to according state
        ret.stats[Object.values(HOST_STATE)[prvStatus] as HOST_STATE] += diffTime;
        //if now state is different add to change (whitch was, how long lasted)
        if(curStatus !== statusNow) {
          const lastStatusTime = ret?.hist[ret.hist.length - ONE]?.time || curTime;
          ret.hist.push({
            status: statusNow,
            time: curTime,
            duration: curTime - lastStatusTime
          });
          //update statusNow
          //IMPORTANT TO ASSING THIS ONLY AFTER PUSHING
          statusNow = curStatus;
        }else if(i === arr.length - ONE) { //on last item add stats untill now
          const lastStatusTime = ret?.hist[ret.hist.length - ONE]?.time || curTime;
          ret.hist.push({
            status: statusNow,
            time: curTime,
            duration: curTime - lastStatusTime
          });
        }
      }
    });
    ret.onlineRate =  Math.round(HUNDRED / (ret.stats[HOST_STATE.online] + ret.stats[HOST_STATE.error] + ret.stats[HOST_STATE.timeout]) * ret.stats[HOST_STATE.online]);
    return ret;
  };
 
  const lastPingData = row.lastPings[row.lastPings.length - ONE] as parseResultInterface | undefined;
  const stats = [ROW_SIZE.x3, ROW_SIZE.x6].includes(row.size) ? getStats(hist) : null; 
  const histForGraph = hist.filter(item => {
    const d = new Date();
    const timeNow =  d.getHours() * HOURinSECONDS + d.getMinutes() * MINUTEinSECONDS + d.getSeconds();
    const latestTime = timeNow - (store.config.minigraphMaxTime * MINUTEinSECONDS);
    return parseInt(item.slice(ZERO, item.length - EIGHT)) > latestTime;
  });
  return <TileRowStyle
    className={`row tileRow ${lastPingData?.status || ""} size${row.size}${row.isPaused ? " paused" : ""}${row.isBusy ? " busy" : ""}${row.isAlarmed ? " alarmed" : ""}${row.isMuted ? " muted" : ""}${row.isSelected ? " selected" : ""}`}
    onContextMenu={methods.handleContextMenu}
    style={{"--rowGroupColor": row.color} as React.CSSProperties}
  >
    <div className="indicator" onClick={methods.toggleSelect}>
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
        <span className={`status ${lastPingData?.status || HOST_STATE.unchecked}`}>{lastPingData?.status || HOST_STATE.unchecked}</span>
        <span className="dellay">{(lastPingData?.status || HOST_STATE.unchecked) === HOST_STATE.online ? (lastPingData?.avgDellay || "-") : "-"} {store.t("ms")} / {row.updateTimeStrategy[(lastPingData?.status || HOST_STATE.unchecked)] / THAUSAND} {store.t("s")}</span>
      </div>
    }
    { [ROW_SIZE.x3, ROW_SIZE.x6].includes(row.size) && 
      <div className="rowPart4">
        <div>{HOST_STATE.online.toUpperCase()}: {toReadibleDuration(stats?.stats[HOST_STATE.online], store)} / {stats?.onlineRate || "-"}%</div>
        <div>{HOST_STATE.error.toUpperCase()}: {toReadibleDuration(stats?.stats[HOST_STATE.error], store)}</div>
        <div>{HOST_STATE.timeout.toUpperCase()}: {toReadibleDuration(stats?.stats[HOST_STATE.timeout], store)}</div>
        <div className="changesHist">{
          stats?.hist.reverse().map(item => {
            return <span key={item.time}>{toReadibleTime(item.time)}: {Object.values(HOST_STATE)[item.status]} ({toReadibleDuration(item.duration, store)})</span>;
          })
        }</div>
      </div>
    }
    { ((ROW_SIZE.x4 === row.size || ROW_SIZE.x6 === row.size) && histForGraph.length > ZERO) && 
      <div className="rowPart3">
        <TileRowGraph size={row.size} hist={histForGraph}></TileRowGraph>
      </div>
    }
    
  </TileRowStyle>;
};