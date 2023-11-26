import React, { FC, useEffect, useState } from "react";
import { DAYinSECONDS, HUNDRED, ONE, PROMPT_TYPES, THAUSAND, TWO, VIEW_TYPE, ZERO } from "src/constants";
import { Option, StoreModel } from "src/models";
import styled from "styled-components";
import { TileRow } from "./TileRow";
import { getHistFileList, readHistDay } from "src/utils/history";
import { ACTION_NAME } from "src/utils/reducer";
import { toReadibleTime } from "src/utils/toReadible";
import { TimeGrid } from "./TimeGrid";
import Select from "./Select";
import addZero from "src/utils/addZero";
import { SortableList, SortableItem } from "./TimeLineSortable";
import { Icon } from "./Icon";

const ViewStyle = styled.div`
  &.tiles{
    width: calc(100vw - 1em);
    height: calc(100vh - 1em);
    display: grid;
    grid-auto-rows: 200px;
    grid-auto-flow: dense;
    --columns-number: 1;
    --rows-number: 1;
    grid-template-columns: repeat(var(--columns-number), calc(100% / var(--columns-number)));
    grid-template-rows: repeat(var(--rows-number), calc(100% / var(--rows-number)));
    overflow-y: auto;
  }
  &.timeline{
    width: calc(100vw - 1em);
    height: calc(100vh - 1em);
    display: flex;
    flex-wrap: wrap;
    overflow-y: auto;
    align-content: flex-start;
    justify-content: flex-start;
    transition: var(--transition);
    .rowList{
      margin: 4em 0;
      width: 100%;
    }
    .datePicker{
      position: fixed;
      width: var(--sidebarWidth);
      height: 4em;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      visibility: hidden;
      transform: translate(0, 5em);
      transition: var(--transition);
      backdrop-filter: blur(5px);
      .input{
        background: var(--bg-color);
      }
    }
    .sliderBlock{
      position: fixed;
      width: calc(100% - 21em);
      bottom: 0;
      left: var(--sidebarWidth);
      height: 2em;
      transition: var(--transition);
      opacity: 0;
      visibility: hidden;
      transform: translate(0, 5em); 
    } 
    .sliderBlock:focus, .sliderBlock:focus-within{
      opacity: 1;
      visibility: visible;
      transform: translate(0);
    } 
    .timeSlider{
      width: 100%;
      height: 100%;
      & div{
        position: absolute;
      }
      & .slider{
        width: 100%;
        height: 0.4em;
        border-radius: 0.1em;
        background: rgba(94, 94, 94, 0.67);
        backdrop-filter: blur(10px);
      }
      & .startHandle, & .endHandle{
        display: inline-block;
        cursor: pointer;
        border-radius: 0.5em;
        width: 1.7em;
        aspect-ratio: 1;
        background: rgba(94, 94, 94, 0.8);
        backdrop-filter: blur(10px);
        transform: translateY(-0.75em);
        --beforeContent: "";
        :before{
          content: var(--beforeContent);
          background: var(--bc-bg);
          box-shadow: var(--shadow);
          backdrop-filter: blur(5px);
          padding: 0.2em 0.5em;
          border-radius: var(--radius);
          transform: translate(-1.8em, -1.5em);
          opacity: 0;
          position: absolute;
          transition: var(--transition);
        }
        :hover, :focus{
          :before{
            opacity: 1;          
            transform: translate(-1.8em, -1.9em);
          }
        }
      }
      --timeLineStart: 25%;
      --timeLineEnd: 50%;
      & .startHandle{
        margin-left: calc(var(--timeLineStart) - 1.5em);
      }
      & .endHandle{
        margin-left: calc(calc(var(--timeLineEnd)) + 0.5em);
      }
      & .rangeHandle{
        display: block;
        height: 0.8em;
        width: calc(var(--timeLineEnd) - var(--timeLineStart) + 0.6em);
        background: var(--bg-color);
        cursor: pointer;
        background: rgba(94, 94, 94, 0.8);
        backdrop-filter: blur(10px);
        transform: translate(0.1em,-0.25em);
        
        margin-left: calc(var(--timeLineStart));
      }
    }

  }
`;

const rowHistUpdateRate = 5000;
let rowHostLastUpdate = 0;

let mouseDownTarget = null as "start" | "range" | "end" | null;
let mouseDownPixel = ZERO as number;
let currentStart = ZERO as number;
let currentEnd = ZERO as number;
let currentDifferenceInTime = ZERO as number; //for optimization


export const View: FC<{
  store: StoreModel
  isModalOpen: boolean
}> = ({
  store,
  isModalOpen
}) => {
  
  const [hist, setHist] = useState({
    rowIds: [] as string[],
    data: [] as string[][]
  });
  useEffect(() => {
    const timeNow = new Date().getTime();
    if(timeNow > rowHostLastUpdate + rowHistUpdateRate) {
      rowHostLastUpdate = timeNow;
      readHistDay(store.config.view === VIEW_TYPE.timeline ? store.state.dateOpened : undefined).then(hist => {
        if(hist) {
          setHist(hist);
        }
      });
    }
  });
  const handleDateChange = (newVal: string) => {
    store.dispatch({
      name: ACTION_NAME.APP_SET_DATE,
      payload: newVal
    });
    readHistDay(newVal).then(hist => {
      if(hist) {
        const stateRowsIds = store.state.rows.map(row => row.id);
        const histRowsIds = hist.rowIds.map(row => parseInt(row));
        if(JSON.stringify(histRowsIds) !== JSON.stringify(stateRowsIds)) {
          const uncreatedRowsIds = histRowsIds.filter(histRow => !stateRowsIds.includes(histRow));
          if(uncreatedRowsIds.length !== ZERO) {
            store.showPrompt(
              store.t("promptDeletedRowsInHistHeader"),
              store.t("promptDeletedRowsInHistText"),
              PROMPT_TYPES.confirm,
              () => { null; },
              (res:string) => {
                if(res === "true") {
                  uncreatedRowsIds.map(item => {
                    store.dispatch({
                      name: ACTION_NAME.ROW_ADD,
                      payload:{
                        id: item
                      }
                    });
                  });
                }
              });
          }
        }
        setHist(hist);
      }
    });
  };

  const getHist = (rowId: number) => {
    const index = hist.rowIds.map(id => parseInt(id)).indexOf(rowId);
    return hist && index !== -ONE ? hist.data[index] : ([] as string[]);
  };
  return <>
    {store.config.view === VIEW_TYPE.tiles && 
      <TilesView  store={store} getHist={getHist} isModalOpen={isModalOpen}/>
    }
    {store.config.view === VIEW_TYPE.timeline && 
      <TimelineView  store={store} getHist={getHist} handleDateChange={handleDateChange} isModalOpen={isModalOpen}/>
    }
  </>;
};

interface TilesViewModel{
  store: StoreModel
  getHist: (arg: number) => string[]
  isModalOpen: boolean
}

const TilesView: FC<TilesViewModel> = ({store, getHist, isModalOpen}) => {
  useEffect(() => {
    window.addEventListener("resize", checkSize, {passive: false});
    return () => {
      window.removeEventListener("resize", checkSize);
    };
  });
  const getViewStyle: () => React.CSSProperties = () => {
    const zoomFactor = ONE / (store.state.zoom / HUNDRED);//donno what's happening here
    const body = document.body;
    const width = body.clientWidth * zoomFactor;
    const height = body.clientHeight * zoomFactor;
    //stringing number for eslint constants rule
    const sizes = ["0", "480", "560", "709", "840", "1080", "1120", "1680", "2160", "10000"];
    const cols = sizes.filter(size => width > parseInt(size)).length;
    const rows = sizes.filter(size => height > parseInt(size)).length;
    return {
      "--columns-number": cols,
      "--rows-number": rows
    } as React.CSSProperties;
  };
  const [size, setSize] = useState(getViewStyle());
  
  const checkSize = () => {
    const styleOnRender = getViewStyle();
    if(JSON.stringify(styleOnRender) !== JSON.stringify(size)) {
      setSize(styleOnRender);
    }
  };
  checkSize();
  return <ViewStyle
    className="view tiles"
    style={size}
  >
    {store.state.rows.map((row, i) => 
      <TileRow
        key={row.id}
        store={store}
        row={row}
        hist={getHist(row.id)}
        tabIndex={isModalOpen ? undefined : TWO + i}
      ></TileRow>)}
  </ViewStyle>;
};

interface TimelineViewModel{
  store: StoreModel
  getHist: (arg: number) => string[]
  handleDateChange: (name: string) => void
  isModalOpen: boolean
}

const TimelineView: FC<TimelineViewModel> = ({store, getHist, handleDateChange, isModalOpen}) => {
  const [hoverTime, setHoverTime] = useState(ZERO);
  const [dateOptions, setDateOptions] = useState([] as Option[]);
  const handleMouseDown = (e: React.MouseEvent, target: "start" | "range" | "end") => {
    if(!mouseDownTarget) {
      mouseDownTarget = target;
      mouseDownPixel = e.clientX;  
      currentStart = store.state.timelineStart;
      currentEnd = store.state.timelineEnd;
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent, target: "start" | "range" | "end") => {
    const speed = e.shiftKey ? THAUSAND : HUNDRED;  
    if(e.code === "ArrowLeft" || e.code === "ArrowRight") {
      const direction = e.code === "ArrowLeft" ? -ONE : ONE;
      store.dispatch({
        name: ACTION_NAME.APP_SET_TIMELINE_RANGE,
        payload: {
          start: target !== "end" ? store.state.timelineStart + (speed * direction) : store.state.timelineStart,
          end: target !== "start" ? store.state.timelineEnd + (speed * direction) : store.state.timelineEnd
        }
      });
    }
  };
  const handleMouseMove = (e: MouseEvent) => {
    if(mouseDownTarget) {
      const currentX = e.clientX;
      const wrapper = document.querySelector(".timeSlider"); 
      const width = wrapper?.clientWidth || ONE;
      const defferenceInPixels = currentX - mouseDownPixel;
      const pixelsToTimeKoof = DAYinSECONDS / width;
      const differenceInTime = Math.round(pixelsToTimeKoof * defferenceInPixels);
      
      if(differenceInTime !== currentDifferenceInTime) {
        store.dispatch({
          name: ACTION_NAME.APP_SET_TIMELINE_RANGE,
          payload: {
            start: mouseDownTarget !== "end" ? currentStart + differenceInTime : currentStart,
            end: mouseDownTarget !== "start" ? currentEnd + differenceInTime : currentEnd
          }
        });
        currentDifferenceInTime = differenceInTime;
      }
    }
  };
  const handleMouseUp = () => {
    if(mouseDownTarget) {
      mouseDownTarget = null;
    }
  };
  useEffect(() => {
    getHistFileList().then((list) => {
      const oplist = list.map(item => {
        return {
          label: item,
          value: item
        }; 
      }).reverse();
      if(JSON.stringify(oplist) !== JSON.stringify(dateOptions)) {
        setDateOptions(oplist);
      }
    });
    window.addEventListener("mouseup", handleMouseUp, {passive: false});
    window.addEventListener("mousemove", handleMouseMove, {passive: false});
    return () => {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);
    };
  });
  const speed = 5;
  const handleWheelCapture = (e: React.WheelEvent) => {
    if(e.deltaX === ZERO) {
      const timeDifferrenceY = e.deltaY * speed;
      store.dispatch({
        name: ACTION_NAME.APP_SET_TIMELINE_RANGE,
        payload: {
          start: store.state.timelineStart - (timeDifferrenceY / TWO),
          end: store.state.timelineEnd + (timeDifferrenceY / TWO)
        }
      });
    }
    if(e.deltaY === ZERO) {
      const timeDifferrence = e.deltaX * speed;
      store.dispatch({
        name: ACTION_NAME.APP_SET_TIMELINE_RANGE,
        payload: {
          start: store.state.timelineStart + (timeDifferrence),
          end: store.state.timelineEnd + (timeDifferrence)
        }
      });
    }
  };
  const handleMouseMoveGraph = (e: React.MouseEvent) => {
    const x = e.clientX;
    const graphElement = document.querySelector(".timeGrid") as HTMLElement;
    const startX = graphElement?.offsetLeft || ZERO;
    const width = graphElement?.clientWidth || HUNDRED;
    const koof = (store.state.timelineEnd - store.state.timelineStart) / width;
    const targetTime = store.state.timelineStart + ((x - startX) *  koof);
    if(hoverTime !== targetTime) {
      setHoverTime(targetTime);
    } 
  };
  const date = new Date();
  const dateToday = `${date.getFullYear()}${addZero(String(date.getMonth() + ONE), TWO)}${addZero(String(date.getDate()), TWO)}.txt`;
  const isHistoryShowing = store.state.dateOpened !== dateToday;
  const handleSortEnd = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    store.dispatch({
      name: ACTION_NAME.ROWS_SWAP,
      payload:{
        from: oldIndex,
        to: newIndex
      }
    });
  };
  const toolTabindex = isModalOpen ? undefined : HUNDRED;
  return <ViewStyle
    className="view timeline"
  >
    <TimeGrid
      store={store} 
      hoverTime={hoverTime} 
      onWheelCapture={handleWheelCapture} 
    />
    <div className="rowList">
      <SortableList
        onSortEnd={handleSortEnd}
        axis={"y"}
        lockAxis="y"
        lockToContainerEdges={true}
        lockOffset={["10%", "10%"]}
        useDragHandle={true}
      >
        {store.state.rows.map((row, i) => 
          <SortableItem
            index={i}
            key={row.id}
            store={store}
            row={row}
            hist={getHist(row.id)}
            onWheelCapture={handleWheelCapture}
            onMouseMoveCapture={handleMouseMoveGraph}
            hoverTime={hoverTime}
            tabIndex={isModalOpen ? undefined : TWO + i}
          >
          </SortableItem>)} 
      </SortableList>
    </div>
    <div className={`datePicker ${isHistoryShowing ? " history" : ""}`}>
      <Icon icon="ico_calendar" />
      <Select
        value={store.state.dateOpened || ""}
        options={dateOptions}
        onChange={handleDateChange}
        styles={ isHistoryShowing ? {"borderColor":"var(--red)"} as React.CSSProperties : undefined} 
        optionsUptop={true}
        tabIndex={toolTabindex}
      />
    </div>
    <div className="sliderBlock">
      <div className="timeSlider"
        style={{
          "--timeLineStart" : ((HUNDRED) / (DAYinSECONDS) * store.state.timelineStart) + "%",
          "--timeLineEnd": ((HUNDRED) / (DAYinSECONDS) * store.state.timelineEnd) + "%"
        } as React.CSSProperties}
      >
        <div className="slider"></div>
        <div className="startHandle"
          style={{
            "--beforeContent":`"${toReadibleTime(store.state.timelineStart)}"`
          } as React.CSSProperties}
          onMouseDown={(e) => handleMouseDown(e, "start")}
          onKeyDown={(e) => handleKeyDown(e, "start")}
          tabIndex={toolTabindex}
        ></div>
        <div className="endHandle"
          style={{
            "--beforeContent":`"${toReadibleTime(store.state.timelineEnd)}"`
          } as React.CSSProperties}
          onMouseDown={(e) => handleMouseDown(e, "end")}
          onKeyDown={(e) => handleKeyDown(e, "end")}
          tabIndex={toolTabindex}
        ></div>
        <div className="rangeHandle"
          onMouseDown={(e) => handleMouseDown(e, "range")}
          onKeyDown={(e) => handleKeyDown(e, "range")}
          tabIndex={toolTabindex}
        ></div>
      </div>
    </div>
  </ViewStyle>;
};