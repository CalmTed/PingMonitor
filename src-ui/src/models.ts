import { IconName } from "./compenents/Icon";
import { HOST_STATE, PROMPT_TYPES, ROW_COLOR, ROW_SIZE } from "./constants";
import { ConfigModel } from "./utils/config";
import { CMItemModel } from "./utils/contextMenuHook";
import { Word } from "./utils/lang";
import { parseResultInterface } from "./utils/ping";
import { ActionType } from "./utils/reducer";

export interface StoreModel {
  state: StateModel
  config: ConfigModel
  t: (word: Word) => string
  dispatch: (action: ActionType) => void
  showToast: (text: string, icon?:IconName) => void
  showAlert: (header: string, text: string, oncancel: () => void, onconfirm: () => void) => void
  showPrompt: (header: string, text: string, type: PROMPT_TYPES, oncancel: () => void, onconfirm: (arg: string) => void, confirmButtonTitle?: string, options?: Option[]) => void 

  showContextMenu: (top: number, left: number, items: (CMItemModel | null)[]) => void
  hideContextMenu: () => void
}

export interface StateModel{
  version: string
  lastChanged: number
  rows: RowModel[]
  rowEditing: number[] | null
  isConfigOpen: boolean
  zoom: number
  timelineStart: number
  timelineEnd: number
  dateOpened: string | null
}

export interface RowModel{
  id: number,
  label: string,
  address: string,
  updateTimeStrategy: UpdateTimeStrategyModel
  color: ROW_COLOR
  size: ROW_SIZE
  picture: IconName
  lastPings: parseResultInterface[]
  isCollapsed: boolean
  isBusy: boolean
  isPaused: boolean
  isMuted: boolean
  isAlarmed: boolean
  isSelected: boolean
}

export interface UpdateTimeStrategyModel{
  [HOST_STATE.online]: number
  [HOST_STATE.error]: number
  [HOST_STATE.timeout]: number
  [HOST_STATE.unchecked]: number
}


export interface Option{
  label: string
  value: string | null
}
export { ActionType };

