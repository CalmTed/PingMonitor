export const VERSION = "1.5.0";

export const TOAST_TIMEOUT = 5000;

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
  gray = "#333",
  red = "#f44",
  orange = "orange",
  yellow = "yellow",
  green = "#4f4",
  blue = "#44f",
  purple = "purple",
  pink = "pink",
}

export enum ROW_SIZE {
  x1 = "x1",
  x2v = "x2v",
  x2h = "x2h",
  x4 = "x4",
  x6 = "x6",
}

export enum PROMPT_TYPES {
  confirm = "confirm",
  select = "select",
  text = "text"
}