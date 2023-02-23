import React, { FC, useEffect, useState } from "react";
import { HUNDRED, ONE, TWO, ZERO } from "src/constants";
import { StateModel, StoreModel } from "src/models";
import { toReadibleTime } from "src/utils/toReadible";
import styled from "styled-components";

interface TimeGridModel{
  store: StoreModel
  hoverTime: number
  onWheelCapture: (e:React.WheelEvent) => void
}

interface timeType {
  time: number
  x: number
  label: string
}

interface svgSizeType {
  width: number
  height: number
}

const TimeGridStyle = styled.div`
  position: fixed;
  width: calc(100% - var(--sidebarWidth) - 0.2em);
  height: calc(100% - 0.8em);
  left: var(--sidebarWidth);
  .grids, .hoverLine{
    strokeWidth: 1em;
    stroke: var(--gray);
  }
  text{
    fill: var(--text-color);
  }
`;

export const TimeGrid: FC<TimeGridModel> = ({store, hoverTime, onWheelCapture}) => {
  const [svgSize, setSvgSize] = useState({
    width: 1000,
    height: 600
  } as svgSizeType);
  useEffect(() => {
    const div = document.querySelector(".timeGrid");
    if(div) {
      const width = div.clientWidth;
      const height = div.clientHeight;
      if(width !== svgSize.width || height !== svgSize.height) {
        setSvgSize({
          width: width,
          height: height
        });
      }
    }
  });
  const getTimes = (state: StateModel) => {
    const timeToStepTime = {
      1: 60,
      600: 120,
      1200: 300,
      3600: 600,
      7200: 1800,
      21600: 3600,
      43200: 7200,
      100000: 14400
    };
    const widthToHalf = 800;
    const ret:timeType[] = [];
    const range = state.timelineEnd - state.timelineStart;
    const closestTimeStep = Object.entries(timeToStepTime).filter(item => parseInt(item[0]) < range).reverse()[0] || ["1", HUNDRED];
    const selectedStepTime = closestTimeStep[1] * (svgSize.width < widthToHalf ? TWO : ONE);
    const startingDifference = (selectedStepTime - state.timelineStart % selectedStepTime);
    const timeToPixelsKoof = svgSize.width / range;
    for(let i = ZERO; i < range / selectedStepTime; i++) {
      const time = state.timelineStart + startingDifference + (selectedStepTime * i);
      const x = (time - state.timelineStart) * timeToPixelsKoof;
      ret.push({
        time,
        x,
        label: toReadibleTime(state.timelineStart + startingDifference + (selectedStepTime * i))
      });
    }
    return ret;
  };
  const getGridsD = (times: timeType[], svgSize: svgSizeType) => {
    return times.map(time => {
      return `M ${time.x} 0, L${time.x} ${svgSize.height}`;
    }).join(" ");
  };
  const getHoverLineD = (x: number, svgSize: svgSizeType) => {
    
    return `M ${x} 0, L${x} ${svgSize.height}`;
  };
  const times = getTimes(store.state);
  
  const hoverData = ((state: StateModel, hoverTime: number) => {
    const range = state.timelineEnd - state.timelineStart;
    const timeToPixelsKoof = svgSize.width / range;
    const x = (hoverTime - state.timelineStart) * timeToPixelsKoof;
    return {
      x,
      label: toReadibleTime(hoverTime)
    };
  })(store.state, hoverTime);

  const labelOffsetLeft = 30;
  return <TimeGridStyle
    className="timeGrid"
    onWheelCapture={onWheelCapture}
  >
    <svg
      viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
    >
      <path className="grids" d={getGridsD(times, svgSize)} />
      {times.map(time => {
        return <text
          key={`${time.x}${time.label}`}
          x={time.x - labelOffsetLeft}
          y={13}
        >
          {time.label}
        </text>;
      })}
      <path className="hoverLine" d={getHoverLineD(hoverData.x, svgSize)} />
      <rect
        x={hoverData.x - labelOffsetLeft}
        width={labelOffsetLeft * TWO}
        y={0}
        height={26}
        fill="var(--bg-color)"
      ></rect>
      <text
        key={`${hoverData.x}${hoverData.label}`}
        x={hoverData.x - labelOffsetLeft}
        y={13}
      >
        {hoverData.label}
      </text>;
    </svg>
  </TimeGridStyle>;
};