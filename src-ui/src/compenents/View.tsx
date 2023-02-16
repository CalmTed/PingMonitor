import React, { FC, useEffect, useState } from "react";
import { HUNDRED, ONE, VIEW_TYPE } from "src/constants";
import { StoreModel } from "src/models";
import styled from "styled-components";
import { TileRow } from "./TileRow";
import { readHistDay } from "src/utils/history";
import { TimelineRow } from "./TimelineRow";
import { ACTION_NAME } from "src/utils/reducer";

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
    .datePicker{

    }
    .timelineSlider{
      position: fixed;
      width: calc(100% - 15em);
      margin-left: 15em;
      bottom: 2em;
      height: 4em;
      input{
        width: calc(100% - 2em);
      }
    } 
  }
`;

const rowHistUpdateRate = 10000;
let rowHostLastUpdate = 0;

export const View: FC<{store: StoreModel}> = ({store}) => {
  
  const [hist, setHist] = useState({
    rowIds: [] as string[],
    data: [] as string[][]
  });
  useEffect(() => {
    const timeNow = new Date().getTime();
    if(timeNow > rowHostLastUpdate + rowHistUpdateRate) {
      rowHostLastUpdate = timeNow;
      readHistDay().then(hist => {
        if(hist) {
          setHist(hist);
        }
      });
    }
  });

  const getHist = (rowId: number) => {
    const index = hist.rowIds.map(id => parseInt(id)).indexOf(rowId);
    return hist && index !== -ONE ? hist.data[index] : ([] as string[]);
  };
  return <>
    {store.config.view === VIEW_TYPE.tiles && 
      <TilesView  store={store} getHist={getHist}/>
    }
    {store.config.view === VIEW_TYPE.timeline && 
      <TimelineView  store={store} getHist={getHist}/>
    }
  </>;
};

interface TilesViewModel{
  store: StoreModel
  getHist: (arg: number) => string[]
}

const TilesView: FC<TilesViewModel> = ({store, getHist}) => {
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
    {store.state.rows.map(row => <TileRow key={row.id} store={store} row={row} hist={getHist(row.id)}></TileRow>)}
  </ViewStyle>;
};

interface TimelineViewModel{
  store: StoreModel
  getHist: (arg: number) => string[]
}

const TimelineView: FC<TimelineViewModel> = ({store, getHist}) => {
  const handleTimelineRangeChange: (arg: {min: number, max: number}) => void = ({min, max}) => {
    store.dispatch({
      name: ACTION_NAME.APP_SET_TIMELINE_RANGE,
      payload:{
        start: min,
        end: max
      }
    }); 
  };

  return <ViewStyle
    className="view timeline"
  >
    {store.state.rows.map(row => <TimelineRow key={row.id} store={store} row={row} hist={getHist(row.id)}></TimelineRow>)}
    <div className="datePicker">

    </div>
    <div className="timelineSlider">
      <input
        type="range"
        min={0}
        max={86400}
        step={1}
        value={store.state.timelineStart}
        onChange={(event) => {
          const value = parseInt(event.target.value); 
          handleTimelineRangeChange({
            max: store.state.timelineEnd,
            min: value
          });
        }}
      />
      <input
        type="range"
        min={0}
        max={86400}
        step={1}
        value={store.state.timelineEnd}
        onChange={(event) => {
          const value = parseInt((event.target as HTMLInputElement).value);
          handleTimelineRangeChange({
            max: value,
            min: store.state.timelineStart
          });
        }}
      />
    </div>
  </ViewStyle>;
};