export const VERSION = "1.5.0";
export const LAST_UPDATE = "2023-02-23";

export const TOAST_TIMEOUT = 5000;

export const TILE_ZOOM_SPEED = 10;

export  const HIST_UPDATRE_RATE_MS = 1000;
export  const HIST_CLASTERING_UPDATE_RATE_MS = 10000;

export const AUTOSAVE_NAME = "autosave.state.pm";
export const AUTOSAVE_TIME_MIN = 15;

export enum VIEW_TYPE {
  tiles = "tiles",
  timeline = "timeline"
}

export enum CONFIG_TYPE {
  row = "row",
  boolean = "boolean",
  number = "number",
  options = "options" 
}

export enum HOST_STATE {
  online = "online",
  timeout = "timeout",
  error = "error",
  unchecked = "unchecked"
}

export enum ROW_COLOR {
  Green = "#4f4",
  Blue = "#0388D2",
  Yellow = "#DECB65",
  Orange = "orange",
  Purple = "purple",
  Gray = "#333",
  White = "#fff"
}

export enum ROW_SIZE {
  x1 = "x1",
  x2h = "x2h",
  x2v = "x2v",
  x3 = "x3",
  x4 = "x4",
  x6 = "x6",
}

export enum PROMPT_TYPES {
  confirm = "confirm",
  select = "select",
  text = "text"
}

export enum EXPORT_TYPE{
  config = "config",
  rowsState = "rowsState",
  historyInJSON = "historyInJSON"
}

export enum IMPORT_TYPE{
  config = "config",
  rowsState = "rowsState"
}

export const ZERO = 0, ONE = 1, TWO = 2, FIVE = 5, EIGHT = 8, SIXTEEN = 16, TWENTY_FOUR = 24, HUNDRED = 100, THAUSAND = 1000;
export const DAYinSECONDS = 86400, HOURinSECONDS = 3600, MINUTEinSECONDS = 60;
