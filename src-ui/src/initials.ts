import { ROW_COLOR, ROW_SIZE, VERSION, VIEW_TYPE } from "./constants";
import { RowModel, StateModel } from "./models";
import { LANG_CODE } from "./utils/lang";

export const getInitialState: () => StateModel = () => {
  return {
    version: VERSION,
    lastChanged: 0,
    langCode: LANG_CODE.en,
    view: VIEW_TYPE.tales,
    rows: getInitialRows()
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
    color: ROW_COLOR.gray,
    size: ROW_SIZE.x2h,
    isCollapsed: true,
    isBusy: false,
    isPaused: false,
    isAlarmed: false,
    isSelected: false
  };
};

const genId = () => {
  const ID_LENGTH = 1000000;
  return Math.round(Math.random() * ID_LENGTH);
};