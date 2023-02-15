import React, { FC } from "react";
import { ONE, ROW_SIZE, TWO, ZERO } from "src/constants";
import { StoreModel } from "src/models";
import { toReadibleTime } from "src/utils/toReadible";
import styled from "styled-components";

type allowedSizeType = ROW_SIZE.x4 | ROW_SIZE.x6;

type pingReport = {
  time: number,
  status: number,
  dellay: number,
  ttl: number
}

interface TileRowGraphModel{
  hist: string[]
  size: allowedSizeType
}

//+show space
//show guides
//show line
//-cut data to length
//-get max and timestamps (len/5)
//add hover action data


const sizes = {
  [ROW_SIZE.x4]: {
    svgHeight: 200,
    svgWidth: 465
  },
  [ROW_SIZE.x6]: {
    svgHeight: 200,
    svgWidth: 700
  }
};
const svgMargin = 10;
const timeTitleMarginRight = 50;
export const TileRowGraph:FC<TileRowGraphModel> = ({hist, size}) => {
  const decodePingReport:(arg: string) => pingReport = (str) => {
    // [54618 0 0000 128]
    const len = str.length;
    const timeStart = 0; //without length
    const timeEnd = -8;
    const statusStart = -8;
    const statusEnd = -7;
    const dellayStart = -7;
    const dellayEnd = -3;
    const ttlStart = -3;
    const ttlEnd = 0;
    return {
      time: parseInt(str.slice(timeStart, len + timeEnd)),
      status: parseInt(str.slice(len + statusStart, len + statusEnd)),
      dellay: parseInt(str.slice(len + dellayStart, len + dellayEnd)),
      ttl: parseInt(str.slice(len + ttlStart, len + ttlEnd))
    };
  };
  const times = [
    {
      x: svgMargin + ZERO,
      title: hist.length ? toReadibleTime(decodePingReport(hist[0]).time) : ""
    },
    {
      x: sizes[size].svgWidth - svgMargin - timeTitleMarginRight,
      title: hist.length ? toReadibleTime(decodePingReport(hist[hist.length - ONE]).time) : ""
    }
  ];
  const histForLine = hist.map(item => decodePingReport(item));
  const maxDellay = Math.max(...histForLine.map(item => item.dellay));
  return <svg 
    width="100%"
    height="100%"
    viewBox={`0 0 ${sizes[size].svgWidth} ${sizes[size].svgHeight}`}
  >
    {/* <rect x={svgMargin} y={svgMargin} height={sizes[size].svgHeight - svgMargin * TWO} width={sizes[size].svgWidth - svgMargin * TWO}></rect> */}
    <Line size={size} hist={histForLine} maxDellay={maxDellay}/>
    <Guides size={size} maxDellay={maxDellay} times={times}/>
  </svg>;
};

interface GuidesComtonentModel {
  size: allowedSizeType
  maxDellay: number
  times: {
    x: number
    title: string
  }[]
}

const guidesDellayMarginLeft = 3;
const guidesMaxDellayMarginBottom = 12;
const guidesMinDellayMarginBottom = -5;
const guidesTimesTitleMarginBottom = 4;
const Guides:FC<GuidesComtonentModel> = ({size, maxDellay, times}) => {
  //y axis
  //x axis
  //max ping time (round up to x500ms)
  //show timestamps
  const textStyles = {
    "fill": "var(--text-color)",
    "font": "13px sans-serif"
  };
  return <g>
    <line x1={svgMargin} y1={svgMargin} x2={svgMargin} y2={sizes[size].svgHeight - svgMargin * TWO} stroke="var(--gray)" />
    <line x1={svgMargin} y1={sizes[size].svgHeight - svgMargin * TWO} x2={sizes[size].svgWidth - svgMargin} y2={sizes[size].svgHeight - svgMargin * TWO} stroke="var(--gray)" />
    <text x={svgMargin + guidesDellayMarginLeft} y={svgMargin + guidesMaxDellayMarginBottom} style={textStyles}>{maxDellay}</text>
    <text x={svgMargin + guidesDellayMarginLeft} y={(sizes[size].svgHeight - svgMargin * TWO) + guidesMinDellayMarginBottom} style={textStyles}>0</text>
    { times.length &&
      <g>{times.map(item => {
        return <text
          key={`${item.x}${item.title}`}
          x={item.x}
          y={(sizes[size].svgHeight - svgMargin) + guidesTimesTitleMarginBottom }
          style={textStyles}
        >
          {item.title}
        </text>;
      })}</g>}
  </g>;
};

interface LineComponentModel {
  size: allowedSizeType
  maxDellay: number
  hist: pingReport[]
}

const PathStyle = styled.g`
  & path{
    transition: all .1s ease;
    fill: none;
    stroke-width: 0.1em;
    &:hover{
      stroke-width: 0.2em;
    }
  }
`;

const Line:FC<LineComponentModel> = ({size, maxDellay, hist}) => {
  const minTime = hist[0].time;
  const timeRange = hist.length > TWO ? hist[hist.length - ONE].time - hist[0].time : TWO;
  const oneSecKoof = (sizes[size].svgWidth - svgMargin * TWO) / timeRange;
  const dellayKoof = (sizes[size].svgHeight - svgMargin * TWO) / (maxDellay || ONE);
  const getD:(arg: pingReport[], isOnline: boolean) => string = (hist, isOnline) => {
    return hist.map((item, i, arr) => {
      const getX:(arg: pingReport) => number = (item) => {
        return svgMargin + (item.time - minTime) * oneSecKoof;
      };
      const getY:(arg: pingReport) => number = (item) => {
        return (sizes[size].svgHeight - svgMargin * TWO) - (item.dellay * dellayKoof); //inverting Y
      };
      if(i === ZERO) {
        return `m${getX(item)}, ${getY(item)}`;
      }
      if(i === arr.length - ONE) {
        return `M${getX(item)},${getY(item)} m${getX(arr[0])},${getY(arr[0])} z`;
      }
      const x1 = getX(item);
      const y1 = getY(item);
      if((item.status === ZERO && isOnline)) {
        return `M${x1},${sizes[size].svgHeight - svgMargin * TWO} L${x1},${y1}`;
      }else if ((item.status !== ZERO && !isOnline)) {
        return `M${x1},0 L${x1},${y1}`;
      }else{
        return "";
      }
    }).join(" ");
  };
  const pathD = getD(hist, true);
  const pathDNonOnline = getD(hist, false);
  return <PathStyle>
    <path
      className="hoverAction"
      d={pathDNonOnline}
      style={{
        stroke: "var(--graph-red)"
      }}
      strokeLinecap="round"
      strokeLinejoin="round"
      rx="0.1"
    />
    <path
      className="hoverAction"
      d={pathD}
      style={{
        stroke: "var(--graph-green)"
      }}
      strokeLinecap="round"
      strokeLinejoin="round"
      rx="0.1"
    />;
  </PathStyle>;
};