import { DAYinSECONDS, ONE, ROW_COLOR, ROW_SIZE, THAUSAND, TWO } from "src/constants";
import { getADefaultRow } from "src/initials";
import { RowModel, StateModel, UpdateTimeStrategyModel } from "src/models";
import { parseResultInterface } from "./ping";

enum ACTION_GROUP {
  app = "APP",
  row = "ROW"
}

export enum ACTION_NAME {
  APP_SET_CONFIG_OPEN_STATE = "APP_SET_CONFIG_OPEN_STATE",
  APP_SET_ZOOM = "APP_SET_ZOOM",
  APP_SET_TIMELINE_RANGE = "APP_SET_TIMELINE_RANGE",

  CONFIG_RERENDER = "CONFIG_RERENDER",

  ROW_ADD = "ROW_ADD",
  ROWS_REMOVE = "ROW_REMOVE",
  ROWS_SET_PARAM = "ROW_SET_PARAM",
  ROWS_SET_UTS = "ROW_SET_UTS",
  ROWS_TOGGLE_EDIT = "ROW_TOGGLE_EDIT",
  ROWS_REPORT_PING = "ROW_REPORT_PING"
}

export type ActionType = {
  name: ACTION_NAME.APP_SET_CONFIG_OPEN_STATE
  payload: boolean
} 
| {
  name: ACTION_NAME.APP_SET_ZOOM
  payload: number
} | {
  name: ACTION_NAME.APP_SET_TIMELINE_RANGE
  payload: {
    start: number
    end: number
  }
} | {
  name: ACTION_NAME.CONFIG_RERENDER
} | {
  name: ACTION_NAME.ROW_ADD
} | {
  name: ACTION_NAME.ROWS_REMOVE
  payload: number[]
} | {
  name: ACTION_NAME.ROWS_SET_PARAM
  payload: {
    rowsId: number[]
    param: keyof RowModel
    value: string | boolean | ROW_COLOR | ROW_SIZE
  }
} | {
  name: ACTION_NAME.ROWS_SET_UTS
  payload: {
    rowsId: number[]
    value: UpdateTimeStrategyModel
  }
} | {
  name: ACTION_NAME.ROWS_TOGGLE_EDIT
  payload: number[] | null
} | {
  name: ACTION_NAME.ROWS_REPORT_PING,
  payload: {
    rowId: number,
    result: parseResultInterface,
    timeToAlarmMS: number
    isAlarmed?: boolean,
    isMuted?: boolean,
  }
}

export const reducer: (state: StateModel, action: ActionType) => StateModel | null = (state, action) => {
  //special case for config change
  if(action.name === ACTION_NAME.CONFIG_RERENDER) {
    return state;
  }

  let newState = null;
  const group = (action.name as unknown as string).split("_")[0] as ACTION_GROUP;
  switch(group) {
  case ACTION_GROUP.app:
    newState = appReducer(state, action);
    break;
  case ACTION_GROUP.row:
    newState = rowReducer(state, action);
  }
  if(newState) {
    newState.lastChanged = new Date().getTime();
    return newState;
  }
  return null;
};

const appReducer: (state: StateModel, action: ActionType) => StateModel | null = (state, action) => {
  let ret: StateModel | null = null;
  switch(action.name) {
  case ACTION_NAME.APP_SET_CONFIG_OPEN_STATE:
    if(state.isConfigOpen === action.payload) {
      break;
    }
    ret = {
      ...state,
      isConfigOpen: action.payload
    };
    break;
  case ACTION_NAME.APP_SET_ZOOM:
    const minZoom = 10;
    const maxZoom = 400;
    if(state.zoom === action.payload || action.payload < minZoom || action.payload > maxZoom) {
      break;
    }
    ret = {
      ...state,
      zoom: action.payload
    };
    break;
  case ACTION_NAME.APP_SET_TIMELINE_RANGE:
    const minRange = 0;
    const maxRange = DAYinSECONDS;
    const minDiff = 300;
    if(
      (action.payload.end <= maxRange || action.payload.start >= minRange)
      && (action.payload.start !== state.timelineStart || action.payload.end !== state.timelineEnd)
      && action.payload.end - action.payload.start > minDiff
    ) {
      ret = {
        ...state,
        timelineStart: action.payload.start >= minRange && action.payload.start <= maxRange - minDiff ? action.payload.start : state.timelineStart,
        timelineEnd: action.payload.end <= maxRange && action.payload.end >= minRange + minDiff ? action.payload.end : state.timelineEnd
      };
    }
    break;
  default: 
    console.error("Unknown app action: ", action);
  }
  return ret;
};

const rowReducer: (state: StateModel, action: ActionType) => StateModel | null = (state, action) => {
  let ret: StateModel | null = null;
  switch(action.name) {
  case ACTION_NAME.ROW_ADD:
    const updatedRows = [...state.rows, getADefaultRow()];
    ret = {
      ...state,
      rows: updatedRows
    };
    break;
  case ACTION_NAME.ROWS_REMOVE:
    const filteredRows = state.rows.filter(row => !action.payload.includes(row.id));
    ret = {
      ...state,
      rows: filteredRows
    };
    break;
  case ACTION_NAME.ROWS_SET_PARAM:
    const changedRows = state.rows.map(row => {
      const resetBusy = action.payload.param === "isPaused" && !action.payload.value;
      if(!action.payload.rowsId.includes(row.id)) {
        return row;
      }else {
        return {
          ...row,
          isBusy: resetBusy ? false : row.isBusy,
          [action.payload.param]: action.payload.value
        };
      }
    });
    ret = {
      ...state,
      rows: changedRows
    };
    break;
  case ACTION_NAME.ROWS_SET_UTS:
    const utsChangedRows = state.rows.map(row => {
      if(!action.payload.rowsId.includes(row.id)) {
        return row;
      }else {
        return {
          ...row,
          isBusy: false, //in case of 99sec or NaN... oto not ot get stack
          updateTimeStrategy: action.payload.value
        };
      }
    });
    ret = {
      ...state,
      rows: utsChangedRows
    };
    break;
  case ACTION_NAME.ROWS_TOGGLE_EDIT:
    if(JSON.stringify(action.payload) === JSON.stringify(state.rowEditing)) {
      return null;
    }
    ret = {
      ...state,
      rowEditing: action.payload
    };
    break;
  case ACTION_NAME.ROWS_REPORT_PING:
    const reportChangedRows = state.rows.map(row => {
      if(action.payload.rowId !== row.id || !row.isBusy || action.payload.result.time === row.lastPings[row.lastPings.length - ONE]?.time) {
        return row;
      }else {
        const d = new Date();
        const hour = 3600, min = 60;
        const timeNow = (d.getHours() * hour + d.getMinutes() * min + d.getSeconds());
        const historyTimeLimit = timeNow - (action.payload.timeToAlarmMS * TWO); //dubling tta time for extra memory
        return {
          ...row,
          isAlarmed: typeof action.payload.isAlarmed !== "undefined" ? action.payload.isAlarmed : row.isAlarmed,
          isMuted: typeof action.payload.isMuted !== "undefined" ? action.payload.isMuted : row.isMuted,
          isBusy: false,
          lastPings: [...row.lastPings.filter(pingData => pingData.time > historyTimeLimit && pingData.time < timeNow * THAUSAND), action.payload.result]
        };
      }
    });
    ret = {
      ...state,
      rows: reportChangedRows
    };
    break;
  default: 
    console.error("Unknown app action: ", action);
  }
  return ret;
};