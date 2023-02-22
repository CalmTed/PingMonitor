import React, { FC, useEffect, useState } from "react";
import { HUNDRED, ONE, ZERO } from "src/constants";
import { StateModel, StoreModel } from "src/models";
import { toReadibleTime } from "src/utils/toReadible";
import styled from "styled-components";

interface TimeGridModel{
  store: StoreModel
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
  .grids{
    strokeWidth: 1em;
    stroke: var(--gray);
  }
  text{
    fill: var(--text-color);
  }
`;

export const TimeGrid: FC<TimeGridModel> = ({store}) => {
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
    const ret:timeType[] = [];
    const range = state.timelineEnd - state.timelineStart;
    const closestTimeStep = Object.entries(timeToStepTime).filter(item => parseInt(item[0]) < range).reverse()[0] || ["1", HUNDRED];
    const startingDifference = (closestTimeStep[1] - state.timelineStart % closestTimeStep[1]);
    const timeToPixelsKoof = svgSize.width / range;
    for(let i = ZERO; i < range / closestTimeStep[1]; i++) {
      const time = state.timelineStart + startingDifference + (closestTimeStep[1] * i);
      const x = (time - state.timelineStart) * timeToPixelsKoof;
      ret.push({
        time,
        x,
        label: toReadibleTime(state.timelineStart + startingDifference + (closestTimeStep[1] * i))
      });
    }
    return ret;
  };
  const getGridsD = (times: timeType[], svgSize: svgSizeType) => {
    return times.map(time => {
      return `M ${time.x} 0, L${time.x} ${svgSize.height}`;
    }).join(" ");
  };
  const times = getTimes(store.state);
  const labelOffsetLeft = 30;
  return <TimeGridStyle
    className="timeGrid"
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
    </svg>
  </TimeGridStyle>;
};