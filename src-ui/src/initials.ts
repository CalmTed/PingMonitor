import { HOST_STATE, ROW_COLOR, ROW_SIZE, VERSION } from "./constants";
import { RowModel, StateModel } from "./models";

export const getInitialState: () => StateModel = () => {
  return {
    version: VERSION,
    lastChanged: 0,
    rows: getInitialRows(),
    isConfigOpen: false,
    rowEditing: null,
    zoom: 100
  };
};

export const getInitialRows: () => RowModel[] = () => {
  return [getADefaultRow()];
};

export const getADefaultRow: () => RowModel = () => {
  return {
    id: genId(),
    label: "DefaultRow",
    address: "localhost",
    updateTimeStrategy: {
      [HOST_STATE.online]: 10000,
      [HOST_STATE.error]: 5000,
      [HOST_STATE.timeout]: 2000,
      [HOST_STATE.unchecked]: 1000
    },
    lastPing: {
      status: HOST_STATE.timeout,
      address: "0.0.0.0",
      time: 0,
      avgDellay: 0,
      ttl: 0,
      date: ""
    },
    picture: "pic_pingMonitor",
    color: ROW_COLOR.Gray,
    size: ROW_SIZE.x2h,
    isCollapsed: true,
    isBusy: false,
    isPaused: true,
    isMuted: false,
    isAlarmed: false,
    isSelected: false
  };
};

const genId = () => {
  const ID_LENGTH = 100000;
  return Math.round(Math.random() * ID_LENGTH);
};