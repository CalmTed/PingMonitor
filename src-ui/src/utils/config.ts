import { CONFIG_TYPE, VERSION } from "src/constants";
import { getADefaultRow } from "src/initials";
import { Option, RowModel } from "src/models";
import { Word } from "./lang";

export const getConfig = () => {
  const localConfigJSON = localStorage.getItem(`config${VERSION}`);

  if(localConfigJSON) {
    try{
      return JSON.parse(localConfigJSON);
    }catch (e) {
      setFullConfig(initialConfig);
      return initialConfig;
    }
  }
};

const setFullConfig: (config:ConfigModel) => void = (config) => {
  localStorage.setItem(`config${VERSION}`, JSON.stringify(config));
};

export const setConfig: (name: keyof ConfigModel, value: ConfigItemType) => void = (name, value) => {
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
      ...JSON.parse(localConfig) as ConfigModel,
      name: value
    };
    setFullConfig(newConfig);
  }
};

export type ConfigItemType = {
  group: string
  label: Word
  type: CONFIG_TYPE.row
  defaultValue: RowModel
  value: RowModel
} | {
  group: string
  label: Word
  type: CONFIG_TYPE.rowGroup
  defaultValue: RowModel[]
  value: RowModel[]
} | {
  group: string
  label: Word
  type: CONFIG_TYPE.boolean
  defaultValue: boolean
  value: boolean
} | {
  group: string
  label: Word
  type: CONFIG_TYPE.number
  defaultValue: number
  value: number
  min: number
  max: number
  step: number
} | {
  group: string
  label: Word
  type: CONFIG_TYPE.options
  defaultValue: string
  value: string
  options: Option[]
}

interface ConfigModel {
  defaultRows: ConfigItemType,
  defaultRow: ConfigItemType
}

const initialConfig: ConfigModel = {
  defaultRows: {
    group: "defaults",
    label: "lang",
    type: CONFIG_TYPE.rowGroup,
    defaultValue: [] as RowModel[],
    value: []
  },
  defaultRow: {
    group: "defaults",
    label: "lang",
    type: CONFIG_TYPE.row,
    defaultValue: getADefaultRow(),
    value: getADefaultRow()
  }
};
