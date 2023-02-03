import { CONFIG_TYPE, VERSION, VIEW_TYPE } from "src/constants";
import { Option, RowModel } from "src/models";
import { LANG_CODE, Word } from "./lang";

export const getConfig: () => ConfigModel = () => {
  const listToTry = getConfigList();
  if(Object.keys(CONFIG_NAMES).length !== Object.keys(listToTry).length) {
    setFullConfig(initialConfig);
  }
  const list = getConfigList();
  const ret: ConfigModel = {
    [CONFIG_NAMES.language]: list[CONFIG_NAMES.language].value as LANG_CODE,
    [CONFIG_NAMES.view]: list[CONFIG_NAMES.view].value as VIEW_TYPE,
    [CONFIG_NAMES.unmuteOnOnline]: list[CONFIG_NAMES.unmuteOnOnline].value as boolean,
    [CONFIG_NAMES.timeToAlarm]: list[CONFIG_NAMES.timeToAlarm].value as number,
    [CONFIG_NAMES.hideAddress]: list[CONFIG_NAMES.hideAddress].value as boolean
  };
  return ret;
};

export const getConfigList: () => ConfigListModel = () => {
  const localConfigJSON = localStorage.getItem(`config${VERSION}`);

  if(localConfigJSON) {
    try{
      return JSON.parse(localConfigJSON);
    }catch (e) {
      setFullConfig(initialConfig);
      return initialConfig;
    }
  }else{
    setFullConfig(initialConfig);
    return initialConfig;
  }
};

const setFullConfig: (config:ConfigListModel) => void = (config) => {
  localStorage.setItem(`config${VERSION}`, JSON.stringify(config));
};

export const setConfig: (name: keyof ConfigListModel, value: ConfigItemType) => void = (name, value) => {
  const isExists = localStorage.getItem(`config${VERSION}`);
  //if not exists
  if(!isExists) {
    setFullConfig(initialConfig);
  }
  //if corrupted
  try{
    JSON.parse(localStorage.getItem(`config${VERSION}`) || "");
  }catch(e) {
    setFullConfig(initialConfig);
  }
  const localConfig = localStorage.getItem(`config${VERSION}`);
  if(localConfig) {
    const newConfig = {
      ...JSON.parse(localConfig) as ConfigListModel,
      [name]: value
    };
    setFullConfig(newConfig);
  }
};

export type ConfigItemType = {
  name: CONFIG_NAMES
  group: Word
  label: Word
  type: CONFIG_TYPE.row
  defaultValue: RowModel
  value: RowModel
} | {
  name: CONFIG_NAMES
  group: Word
  label: Word
  type: CONFIG_TYPE.boolean
  defaultValue: boolean
  value: boolean
} | {
  name: CONFIG_NAMES
  group: Word
  label: Word
  type: CONFIG_TYPE.number
  defaultValue: number
  value: number
  min: number
  max: number
  step: number
} | {
  name: CONFIG_NAMES
  group: Word
  label: Word
  type: CONFIG_TYPE.options
  defaultValue: string
  value: string
  options: Option[]
}

//config list
//default new row rule
//defeult new row
//history save limit
//time to alarm
//unmute on getting online
export enum CONFIG_NAMES {
  language = "language",
  unmuteOnOnline = "unmuteOnOnline",
  hideAddress = "hideAddress",
  timeToAlarm = "timeToAlarm",
  view = "view"
}

export interface ConfigListModel {
  [CONFIG_NAMES.language]: ConfigItemType
  [CONFIG_NAMES.view]: ConfigItemType
  [CONFIG_NAMES.unmuteOnOnline]: ConfigItemType
  [CONFIG_NAMES.hideAddress]: ConfigItemType
  [CONFIG_NAMES.timeToAlarm]: ConfigItemType
}

export type ConfigModel = {
  [CONFIG_NAMES.language]: LANG_CODE
  [CONFIG_NAMES.view]: VIEW_TYPE
  [CONFIG_NAMES.unmuteOnOnline]: boolean
  [CONFIG_NAMES.timeToAlarm]: number
  [CONFIG_NAMES.hideAddress]: boolean
};

const initialConfig: ConfigListModel = {
  //GENERAL
  [CONFIG_NAMES.language]: {
    name: CONFIG_NAMES.language,
    group: "configGroupGeneral",
    label: "configLanguage",
    type: CONFIG_TYPE.options,
    options: [
      {
        label: "English",
        value: LANG_CODE.en
      },
      {
        label: "Українська",
        value: LANG_CODE.ua
      },
      {
        label: "Française",
        value: LANG_CODE.fr
      }
    ],
    defaultValue: LANG_CODE.en,
    value: LANG_CODE.en 
  },
  [CONFIG_NAMES.view]: {
    name: CONFIG_NAMES.view,
    group: "configGroupGeneral",
    label: "configView",
    type: CONFIG_TYPE.options,
    options: [
      {
        label: "configViewTiles",
        value: VIEW_TYPE.tiles
      },
      {
        label: "configViewTimeline",
        value: VIEW_TYPE.timeline
      }
    ],
    defaultValue: VIEW_TYPE.tiles,
    value: VIEW_TYPE.tiles 
  },
  //ROW
  [CONFIG_NAMES.unmuteOnOnline]: {
    name: CONFIG_NAMES.unmuteOnOnline,
    group: "configGroupRow",
    label: "configUnmuteOnOnline",
    type: CONFIG_TYPE.boolean,
    defaultValue: false,
    value: false 
  },
  [CONFIG_NAMES.timeToAlarm]: {
    name: CONFIG_NAMES.timeToAlarm,
    group: "configGroupRow",
    label: "configTimeToAlarm",
    type: CONFIG_TYPE.number,
    defaultValue: 10000,
    value: 10000,  
    min: 1000,
    max: 30000,
    step: 1000
  },
  [CONFIG_NAMES.hideAddress]: {
    name: CONFIG_NAMES.hideAddress,
    group: "configGroupRow",
    label: "configHideAddress",
    type: CONFIG_TYPE.boolean,
    defaultValue: false,
    value: false
  }
};