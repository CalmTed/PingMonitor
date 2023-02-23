import React, { FC, useEffect } from "react";
import { HOST_STATE, HOURinSECONDS, ONE, TWENTY_FOUR, TWO, ZERO } from "src/constants";
import { RowModel, StateModel, StoreModel } from "src/models";
import { parseResultInterface } from "src/utils/ping";
import styled from "styled-components";
import { getRowMethods } from "./TileRow";
import { Icon } from "./Icon";
import { Guides, Line, decodePingReport, pingReport } from "./RowGraph";
import { toReadibleTime } from "src/utils/toReadible";
import { RowHandler } from "./TimeLineSortable";

export interface TimelineRowModel{
  store: StoreModel
  row: RowModel
  hist: string[]
  onWheelCapture: (e: React.WheelEvent) => void
  onMouseMoveCapture: (e: React.MouseEvent) => void
  hoverTime: number
}

const TimelineRowStyle = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-wrap: nowrap;
  margin: 0.2em 0;
  overflow: hidden; 
  position: relative;

  --row-color: var(--gray);
  --graph-green: var(--rowGroupColor);
  --graph-red: var(--red);
  .head{
    transition: var(--transition);
    width: calc(var(--sidebarWidth) - 3em);
    height: 8em;
    padding: 0.5em 1em;
    border-width 0.2em;
    border-style: solid;
    border-color: var(--row-color);
    border-radius: var(--radius);  
    backdrop-filter: blur(5px);
    .label{
      margin-top: 0.1em;
      text-transform: uppercase;
    }
    .address{
      opacity: 0.6;
    }
  }
  &.collapsed .head, &.collapsed .tail{
    height: 3em;
  }
  
  .tail{
    height: 9em;
    width: 100%;
  }
  
  
  &.online:not(.busy){
    --row-color: var(--rowGroupColor);
  }
  &.timeout:not(.busy), &.error:not(.busy){
    --row-color: var(--red);
    head{
      border-style: dashed;
    }
  }
  &.paused.busy, &.paused:not(.busy){
    --row-color: var(--gray);
    opacity: 0.9;
  }

  &.paused, &.alarmed{
    .head{
      background-image: repeating-linear-gradient(45deg, var(--row-color) 0, var(--row-color) 2px, transparent 0, transparent 16px);
    }

  }

  &.busy:not(.alarmed){
    --row-color: transparent;
  }
  &.busy.alarmed{
    --row-color: var(--red);
    .head, .indicator{
      border-style: dashed;
    }
  }

  //INDACATOR

  .indicator{
    min-height: 0.3em;
    min-width: 0.3em;
    position: absolute;
    background: var(--bg-color);
    border-radius: 50em;
    font-size: 2em;
    padding: 0.2em;
    border: 0.1em solid var(--row-color);
    margin-left: -0.9em;
    margin-top: -0.5em;
    transition: transform .2s ease, margin .2s ease;
    opacity: 0;
    cursor: pointer;
    transform: scale(0.9);
    .icon{
      width: 0.6em;
    }
  }
  .dragHandle{
    min-height: 0.3em;
    min-width: 0.3em;
    position: absolute;
    background: var(--bg-color);
    border-radius: 50em;
    font-size: 2em;
    padding: 0.2em;
    border: 0.1em solid var(--row-color);
    transition: transform .2s ease, margin .2s ease, background .1s ease;
    margin-left: -0.9em;
    margin-top: 0.5em;  
    opacity: 0;
    cursor: grab;
    transform: scale(0.9);
    :hover{
      background: var(--gray);
    }
  }
  &.alarmed .indicator, &.muted .indicator, &.selected .indicator, &:hover .indicator,
  &:hover .dragHandle{
    opacity: 1;
    transform: scale(1);
  }

`;

export const TimelineRow: FC<TimelineRowModel> = ({store, row, hist, onWheelCapture, onMouseMoveCapture, hoverTime}) => {
  const methods = getRowMethods(store, row);
  useEffect(methods.useEffect);

  const handleToggleCollapsed = () => {
    methods.handleChange("isCollapsed", !row.isCollapsed, [row.id]);
  };

  const lastPingData = row.lastPings[row.lastPings.length - ONE] as parseResultInterface | undefined;
  const classes = `tileRow ${lastPingData?.status || ""} ${row.isPaused ? " paused" : ""}${row.isBusy ? " busy" : ""}${row.isAlarmed ? " alarmed" : ""}${row.isMuted ? " muted" : ""}${row.isSelected ? " selected" : ""}${row.isCollapsed ? " collapsed" : ""}`;

  return <TimelineRowStyle
    className={`row timelineRow ${classes}`}
    onContextMenu={methods.handleContextMenu}
    onDoubleClick={handleToggleCollapsed}
    style={{"--rowGroupColor": row.color} as React.CSSProperties}
    title={String(row.id)}
  >
    <div className="head">
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
      <RowHandler></RowHandler>
      <div className="label">{row.label}</div>
      {!store.config.hideAddress && <div className="address">{row.address}</div>}
    </div> 
    <TimelineRowGraph
      store={store}
      histString={hist.length > ZERO ?  hist : []}
      isCollapsed={row.isCollapsed}
      className="tail"
      onWheelCapture={onWheelCapture}
      onMouseMoveCapture={onMouseMoveCapture}
      hoverTime={hoverTime}
    />
  </TimelineRowStyle>;
};

interface TimelineRowGraphModel{
  store: StoreModel
  histString: string[]
  isCollapsed: boolean
  className?: string
  onWheelCapture: (e: React.WheelEvent) => void
  onMouseMoveCapture: (e: React.MouseEvent) => void
  hoverTime: number
}

const TimelineRowGraphStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - var(--sidebarWidth) + 1em);
  path{
    stroke-width: 0.4em;
  }
  rect{
    fill: #000;
  }

  .hoverLine{
    stroke: var(--rowGroupColor);
    stroke-width: 0.8em;
    &.red{
      stroke: var(--red);  
    }
  }
  .hoverTimeLabel{
    opacity: 0;
  }
  &:hover .hoverTimeLabel{
    opacity: 1;
  }
`;

const defaultGraphWigth = 1400;
const defaultGraphHeight = 70;

const TimelineRowGraph:FC<TimelineRowGraphModel> = ({store, histString, isCollapsed, className, onWheelCapture, onMouseMoveCapture, hoverTime}) => {
  //setting all time to 1ms if row is collapsed
  const hist = isCollapsed ? histString.map(item => decodePingReport(item)).filter(item => item.time > store.state.timelineStart && item.time < store.state.timelineEnd).map(item => { return {
    ...item,
    dellay: 1}; }) : histString.map(item => decodePingReport(item)).filter(item => item.time > store.state.timelineStart && item.time < store.state.timelineEnd);
  //getting renderd size
  const tailWidth = document.body.clientWidth - ((document.querySelector(".row .head") as HTMLElement)?.clientWidth || defaultGraphWigth);
  const tailHeight = (document.querySelector(".row .collapsed") as HTMLElement)?.clientHeight || defaultGraphHeight;
  const heightKoof = 3, widthKoof = 1.7;//default aspect ratio
  const graphHeight = isCollapsed ? tailHeight : tailHeight * heightKoof;
  const graphWidth = tailWidth * widthKoof;
  const maxDellay = isCollapsed ? TWO : Math.max(...hist.map(item => item.dellay));
  const avgDellay = hist.reduce((sum, item) => sum + item.dellay, ZERO) / hist.length;

  const hoverData = ((state: StateModel, hist: pingReport[], hoverTime: number) => {
    const range = state.timelineEnd - state.timelineStart;
    const timeToPixelsKoof = graphWidth / range;
    const closestItem = hist.map(item => {
      return {
        item, 
        dist: Math.abs(item.time - hoverTime) 
      }; }
    ).sort((a, b) => {
      return a.dist - b.dist; 
    })[0];
    if(!closestItem) {
      return null;
    }
    const x = (closestItem.item.time - state.timelineStart) * timeToPixelsKoof;
    const status = Object.values(HOST_STATE)[closestItem.item.status];
    return {
      x,
      label: toReadibleTime(closestItem.item.time), 
      height: isCollapsed || status !== HOST_STATE.online ? graphHeight : graphHeight / maxDellay * closestItem.item.dellay,
      ttl: closestItem.item.ttl,
      dellay: closestItem.item.dellay,
      status
    };
  })(store.state, hist, hoverTime);
  return <TimelineRowGraphStyle
    onWheelCapture={onWheelCapture}
    onMouseMove={onMouseMoveCapture}
    title={ hoverData ? `${hoverData.label}\n${hoverData.dellay}\n${hoverData.status}\nTTL: ${hoverData.ttl}` : ""}
  >
    <svg  
      width="100%"
      height="100%"
      viewBox={`0 0 ${graphWidth} ${graphHeight}`}
      className={`${className}`}
    >
      <Line
        width={graphWidth}
        height={graphHeight}
        margin={0}
        maxDellay={maxDellay}
        minTime={store.state.timelineStart || ZERO}
        maxTime={store.state.timelineEnd || HOURinSECONDS * TWENTY_FOUR}
        hist={hist}
      />
      {hoverData && <>
        <path
          className={`hoverLine ${hoverData.status !== HOST_STATE.online ? " red" : ""}`}
          d={`M ${hoverData.x} ${graphHeight}, L ${hoverData.x} ${graphHeight - hoverData.height}`}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
        </path>
        {/* <text
          className="hoverTimeLabel"
          x={hoverData.x - hoverLabelWidth}
          y={graphHeight}
          fill="var(--text-color)"
          style={{
            "font": "20px sans-serif"
          }}
        >{hoverData.label}</text> */}
      </>}
      {!isCollapsed &&
        <Guides
          width={graphWidth}
          height={graphHeight}
          margin={0}
          maxDellay={maxDellay}
          avgDellay={avgDellay}
          times={[]}
          fontSize={25}
        />
      }
    </svg>
  </TimelineRowGraphStyle>;
};