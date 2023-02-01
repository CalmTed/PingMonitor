import { HOST_STATE, ROW_COLOR, ROW_SIZE, VERSION } from "./constants";
import { RowModel, StateModel } from "./models";

export const getInitialState: () => StateModel = () => {
  return {
    version: VERSION,
    lastChanged: 0,
    rows: getInitialRows(),
    isConfigOpen: false,
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
    updateTimeStrategy: [

    ],
    lastPing: {
      status: HOST_STATE.unchecked,
      address: "",
      time: 0,
      avgDellay: 0,
      ttl: null
    },
    picture: "ico_play",
    color: ROW_COLOR.gray,
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
  const ID_LENGTH = 1000000;
  return Math.round(Math.random() * ID_LENGTH);
};