import { HOST_STATE, ROW_COLOR, ROW_SIZE, VIEW_TYPE } from "./constants";
import { LANG_CODE } from "./utils/lang";
import { ActionType } from "./utils/reducer";

export interface StoreModel {
  state: StateModel
  dispatch: (action: ActionType) => void
  showToast: (text: string) => void
  showAlert: (header: string, text: string, oncancel: () => void, onconfirm: () => void) => void
  showPrompt: (header: string, text: string, oncancel: () => void, onconfirm: (arg: string) => void) => void 
}

export interface StateModel{
  version: string
  lastChanged: number
  langCode: LANG_CODE
  view: VIEW_TYPE
  rows: RowModel[]
}

export interface RowModel{
  id: number,
  label: string,
  address: string,
  updateTimeStrategy: UpdateTimeStrategyItem[]
  color: ROW_COLOR
  size: ROW_SIZE
  isCollapsed: boolean
  isBusy: boolean
  isPaused: boolean
  isAlarmed: boolean
  isSelected: boolean
}

export interface UpdateTimeStrategyItem{
  state: HOST_STATE
  updateTime: number
}


export interface Option{
  label: string
  value: string
}
export { ActionType };

