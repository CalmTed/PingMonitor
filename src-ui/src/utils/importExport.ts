import { StateModel, StoreModel } from "src/models";
import { readHistDay } from "./history";
import { decodePingReport } from "src/compenents/RowGraph";
import { save, open } from "@tauri-apps/api/dialog";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { TWO, ZERO } from "src/constants";
import { ConfigModel, getConfig } from "./config";



//export state, config, history reports
//import the same check for the same id(prompt: overwrite, pass, changeid)

export enum EXPORT_TYPE{
  config = "config",
  rowsState = "rowsState",
  historyInJSON = "historyInJSON"
}

export enum IMPORT_TYPE{
  config = "config",
  rowsState = "rowsState"
}

export const exportData:(store: StoreModel, type: EXPORT_TYPE) => Promise<boolean> = async (store, type) => {
  let data = "";
  let name = "";
  let extention = "txt";
  console.log("exporting", type);
  switch(type) {
  case EXPORT_TYPE.historyInJSON:
    const readDay = await readHistDay(store.state.dateOpened);
    if(!readDay) {
      break;
    }
    const dayData = readDay.data.map(row => {
      return row.map(item => {
        return decodePingReport(item);
      });
    });
    data = JSON.stringify({
      rowIds: readDay.rowIds,
      data: dayData
    }, null, TWO);
    name = "PingData.json";
    extention = "json";
    break;
  case EXPORT_TYPE.rowsState:
    data = JSON.stringify(store.state, null, TWO);
    name = "State1.5.0.state.pm";
    extention = "state.pm";
    break;
  case EXPORT_TYPE.config:
    const config = getConfig();
    data = JSON.stringify(config, null, TWO);
    name = "Config1.5.0.config.pm";
    extention = "config.pm";
    break;
  }
  const filePath = await save({
    filters: [{
      name: name,
      extensions: [extention]
    }]
  });
  if(filePath) {
    await writeTextFile(filePath, data, {dir: BaseDirectory.Document});
    return true;
  }
  return false;
};

export const importData:(store: StoreModel, type: IMPORT_TYPE) => Promise<ConfigModel | StateModel | null> = async (store, type) => {
  let name = "";
  let extention = "txt";
  switch(type) {
  case IMPORT_TYPE.rowsState:
    name = "State1.5.0.state.pm";
    extention = "state.pm";
    break;
  case IMPORT_TYPE.config:  
    name = "Config1.5.0.config.pm";
    extention = "config.pm";
    break;
  }
  const filePath = await open({
    multiple: false,
    filters: [{
      name: name,
      extensions: [extention]
    }]
  });
  if(!filePath || Array.isArray(filePath)) {
    return null;
  }
  const fileContent = await readTextFile(filePath, {dir: BaseDirectory.Document});
  if(!fileContent || fileContent.length === ZERO) {
    return null;
  }
  try{
    return JSON.parse(fileContent);
  }catch(e) {
    return null;
  }
};