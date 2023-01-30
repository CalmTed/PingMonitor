import { StateModel } from "src/models";
import { LANG_CODE } from "./lang";

enum ACTION_GROUP {
  app = "APP",
  config = "CONFIG",
  row = "ROW"
}

export enum ACTION_NAME {
  APP_SET_LANG_CODE = "APP_SET_LANG_CODE"
}

export type ActionType = {
  name: ACTION_NAME.APP_SET_LANG_CODE
  payload: LANG_CODE
}
 

export const reducer: (state: StateModel, action: ActionType) => StateModel | null = (state, action) => {
  // let changedFlag = false;
  // const stateChanged = () => {
  //   changedFlag = true;
  // };
  let newState = null;
  const group: ACTION_GROUP = (action.name as unknown as string).split("_")[0] as ACTION_GROUP;
  switch(group) {
  case ACTION_GROUP.app:
    newState = appReducer(state, action);
    break;
  }
  if(newState) {
    newState.lastChanged = new Date().getTime();
    return newState;
  }
  return null;
};

const appReducer: (state: StateModel, action: ActionType) => StateModel | null = (state, action) => {
  switch(action.name) {
  case ACTION_NAME.APP_SET_LANG_CODE:
    if(state.langCode === action.payload) {
      return null;
    }
    return {
      ...state,
      langCode: action.payload
    } as StateModel;
  default: 
    return null;
  }
};