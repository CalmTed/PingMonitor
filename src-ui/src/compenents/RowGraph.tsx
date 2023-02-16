import React, { FC } from "react";
import { HUNDRED, ONE, ROW_SIZE, TWO, ZERO } from "src/constants";
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
export const decodePingReport:(arg: string) => pingReport = (str) => {
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
export const TileRowGraph:FC<TileRowGraphModel> = ({hist, size}) => {
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
  const avgDellay = histForLine.reduce((sum, item) => sum + item.dellay, ZERO) / histForLine.length;
  return <svg 
    width="100%"
    height="100%"
    viewBox={`0 0 ${sizes[size].svgWidth} ${sizes[size].svgHeight}`}
  >
    <Line
      width={sizes[size].svgWidth}
      height={sizes[size].svgHeight}
      margin={svgMargin}
      hist={histForLine}
      maxDellay={maxDellay}
      minTime={histForLine[0]?.time || ZERO}
      maxTime={histForLine[histForLine.length - ONE]?.time || ONE}  
    />
    <Guides
      width={sizes[size].svgWidth}
      height={sizes[size].svgHeight}
      margin={svgMargin}
      maxDellay={maxDellay}
      avgDellay={avgDellay}
      times={times}
    />
  </svg>;
};

interface GuidesComtonentModel {
  width: number
  height: number
  margin: number
  maxDellay: number
  avgDellay: number
  times: {
    x: number
    title: string
  }[],
  fontSize?: number
}

const guidesDellayMarginLeft = 3;
const guidesMaxDellayMarginBottom = 12;
const guidesMinDellayMarginBottom = -5;
const guidesTimesTitleMarginBottom = 4;

export const Guides:FC<GuidesComtonentModel> = ({width, height, margin, maxDellay, avgDellay, times, fontSize}) => {
  //y axis
  //x axis
  //max ping time (round up to x500ms)
  //show timestamps
  const defaultFontSize = 13;
  const textStyles = {
    "fill": "var(--text-color)",
    "font": `${fontSize || defaultFontSize}px sans-serif`
  };
  const avgRelativeHight = (height - margin) - height * (ONE / maxDellay * avgDellay) || ZERO;
  const dotts = {
    topLine: {
      x1: margin,
      y1: margin,
      x2: width - margin,
      y2: margin
    },
    topLabel: {
      x: margin + guidesDellayMarginLeft,
      y: margin + guidesMaxDellayMarginBottom
    },
    avgLine: {
      x1: margin,
      y1: avgRelativeHight,
      x2: width - margin,
      y2: avgRelativeHight
    },
    avgLabel: {
      x: margin + guidesDellayMarginLeft,
      y: avgRelativeHight
    },
    bottomLine: {
      x1: margin,
      y1: height - margin * TWO,
      x2: width - margin,
      y2: height - margin * TWO
    },
    bottomLabel: {
      x: margin + guidesDellayMarginLeft,
      y: (height - margin * TWO) + guidesMinDellayMarginBottom
    }
  
  };
  return <g>
    <line x1={dotts.topLine.x1} y1={dotts.topLine.y1} x2={dotts.topLine.x2} y2={dotts.topLine.y2} stroke="var(--gray)" />
    <text x={dotts.topLabel.x} y={dotts.topLabel.y} style={textStyles}>{maxDellay}</text>
    
    {avgDellay > ZERO && <>
      <line x1={dotts.avgLine.x1} y1={dotts.avgLine.y1} x2={dotts.avgLine.x2} y2={dotts.avgLine.y2} stroke="var(--gray)" />
      <text x={dotts.avgLabel.x} y={dotts.avgLabel.y} style={textStyles}>{Math.round(avgDellay)}</text>
    </>}
    
    <line x1={dotts.bottomLine.x1} y1={dotts.bottomLine.y1} x2={dotts.bottomLine.x2} y2={dotts.bottomLine.y2} stroke="var(--gray)" />
    <text x={dotts.bottomLabel.x} y={dotts.bottomLabel.y} style={textStyles}>0</text>
    { times.length &&
      <g>{times.map(item => {
        return <text
          key={`${item.x}${item.title}`}
          x={item.x}
          y={(height - margin) + guidesTimesTitleMarginBottom }
          style={textStyles}
        >
          {item.title}
        </text>;
      })}</g>}
  </g>;
};

interface LineComponentModel {
  width: number
  height: number
  margin: number
  maxDellay: number
  minTime: number
  maxTime: number
  hist: pingReport[]
}

const PathStyle = styled.g`
  & path{
    // transition: all .1s ease;
    fill: none;
    stroke-width: 0.15em;
  }
`;

export const Line:FC<LineComponentModel> = ({width, height, margin, maxDellay, minTime = ZERO, maxTime = HUNDRED, hist}) => { 
  // const minTime = hist[0].time;
  const timeRange = maxTime - minTime;
  const oneSecKoof = (width - margin * TWO) / timeRange;
  const dellayKoof = (height - margin * TWO) / (maxDellay || ONE);
  const getD:(arg: pingReport[], isOnline: boolean) => string = (hist, isOnline) => {
    return hist.map((item, i, arr) => {
      const getX:(arg: pingReport) => number = (item) => {
        return margin + (item.time - minTime) * oneSecKoof;
      };
      const getY:(arg: pingReport) => number = (item) => {
        return (height - margin) - (item.dellay * dellayKoof); //inverting Y
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
        return `M${x1},${height - margin * TWO} L${x1},${y1}`;
      }else if ((item.status !== ZERO && !isOnline)) {
        return `M${x1},${margin} L${x1},${(height - margin * TWO)}`;
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