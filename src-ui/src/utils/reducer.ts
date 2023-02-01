import { ROW_COLOR, ROW_SIZE } from "src/constants";
import { getADefaultRow } from "src/initials";
import { RowModel, StateModel, UpdateTimeStrategyItem } from "src/models";

enum ACTION_GROUP {
  app = "APP",
  row = "ROW"
}

export enum ACTION_NAME {
  APP_SET_CONFIG_OPEN_STATE = "APP_SET_CONFIG_OPEN_STATE",
  APP_SET_ZOOM = "APP_SET_ZOOM",

  CONFIG_RERENDER = "CONFIG_RERENDER",

  ROW_ADD = "ROW_ADD",
  ROWS_REMOVE = "ROW_REMOVE",
  ROWS_SET_PARAM = "ROW_SET_PARAM",
  ROWS_SET_UTS = "ROWS_SET_UTS"
}

export type ActionType = {
  name: ACTION_NAME.APP_SET_CONFIG_OPEN_STATE
  payload: boolean
} 
| {
  name: ACTION_NAME.APP_SET_ZOOM
  payload: number
}   | {
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
    param: keyof RowModel
    value: UpdateTimeStrategyItem
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
      if(!action.payload.rowsId.includes(row.id)) {
        return row;
      }else {
        return {
          ...row,
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
    break;
  default: 
    console.error("Unknown app action: ", action);
  }
  return ret;
};