import { HOST_STATE, ROW_COLOR, ROW_SIZE, VERSION } from "./constants";
import { RowModel, StateModel } from "./models";
import addZero from "./utils/addZero";

export const getInitialState: () => StateModel = () => {
  const date = new Date(), one = 1, two = 2;
  return {
    version: VERSION,
    lastChanged: 0,
    rows: getInitialRows(),
    isConfigOpen: false,
    rowEditing: null,
    zoom: 100,
    timelineStart: 0,
    timelineEnd: 86400,
    dateOpened: `${date.getFullYear()}${addZero(String(date.getMonth() + one), two)}${addZero(String(date.getDate()), two)}.txt`
  };
};

export const getInitialRows: () => RowModel[] = () => {
  return [getADefaultRow()];
};

export const getADefaultRow: (id?: number) => RowModel = (id = genId()) => {
  return {
    id: id,
    label: "DefaultRow",
    address: "localhost",
    updateTimeStrategy: {
      [HOST_STATE.online]: 10000,
      [HOST_STATE.error]: 5000,
      [HOST_STATE.timeout]: 2000,
      [HOST_STATE.unchecked]: 1000
    },
    lastPings: [],
    picture: "pic_pingMonitor",
    color: ROW_COLOR.Green,
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