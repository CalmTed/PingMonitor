import { FIVE, HIST_CLASTERING_UPDATE_RATE_MS, HIST_UPDATRE_RATE_MS, HOST_STATE, HOURinSECONDS, MINUTEinSECONDS, ONE, SIXTEEN, TWO, ZERO } from "src/constants";
import addZero from "./addZero";
import { readFile, readFolderItems, writeFile } from "./fs";
import { getConfig } from "./config";


let histLastUpadte = 0;
let histLastClastered = 0;
export const getHistFileList: () => Promise<string[]> = async () => {
  //lookup for a file
  const items = await readFolderItems("");
  if(!items) {
    const date = new Date();
    return [`${date.getFullYear()}${addZero(String(date.getMonth() + ONE), TWO)}${addZero(String(date.getDate()), TWO)}.txt`];
  }
  return items.filter(item => /[0-9]{8}.txt/g.test(item?.name || "")).map(item => item.name || "");
};

export const readHistDay: (arg?: string) => Promise<{rowIds: string[], data:string[][]} | null> = async (fileName) => {
  //[(1-67000) 999999 1 0001 001]
  if (!fileName) {
    const date = new Date();
    fileName = `${date.getFullYear()}${addZero(String(date.getMonth() + ONE), TWO)}${addZero(String(date.getDate()), TWO)}.txt`;
  }
  //read a file
  const fileContent = await readFile(fileName);
  if(!fileContent) {
    return null;
  }
  const fileArray = fileContent?.split(" ");
  //convert hex to numbers
  const fileBigIntArray = fileArray.filter(item => item.length).map(item => BigInt("0x" + item));
  //get all addreses
  const rowIds = new Set();
  const substrStart =  14;//from the end
  const substrEnd = 8;
  fileBigIntArray.forEach(item => {
    const string = item.toString();
    rowIds.add(string.substring(string.length - substrStart, string.length - substrEnd));
  });
  //filter by addreses
  const data: string[][] = [];
  fileBigIntArray.forEach(item => {
    const string = item.toString();
    const rowId = string.substring(string.length - substrStart, string.length - substrEnd);
    const index = [...rowIds].indexOf(rowId);
    if(!data[index]) {
      data[index] = [];
    }
    const noIDString = string.substring(ZERO, string.length - substrStart) + string.substring(string.length - substrEnd, string.length);
    data[index].push(noIDString);
  });
  return {
    rowIds: [...rowIds] as string[],
    data
  };
};
interface writeHistModel{
  time: number
  rowId: number
  state: HOST_STATE
  dellay: number
  ttl: number
}


export const writeHist: (arg: writeHistModel) => Promise<string> = async ({time, rowId, state, dellay, ttl}) => {
  const config = getConfig();
  const targetTTLlength = 3;
  const targetDellayLength = 4;
  const rowIdTargetLenght = 6;
  //convert host state to number
  const stateNum = Object.values(HOST_STATE).indexOf(state);

  //convert to hex
  const line = `${time}${addZero(String(rowId), rowIdTargetLenght)}${stateNum}${addZero(String(dellay), targetDellayLength)}${addZero(String(ttl), targetTTLlength)}`;
  const lineNum = BigInt(line);
  const lineHex = lineNum.toString(SIXTEEN);
  
  //append to file
  const d = new Date();
  const fileName = `${d.getFullYear()}${addZero(String(d.getMonth() + ONE), TWO)}${addZero(String(d.getDate()), TWO)}.txt`;
  const localHistory = localStorage.getItem(`hist_${fileName}`) || "";
  const updatedLocalHistory = `${localHistory} ${lineHex} `;
  
  //clastering every 5 sec
  if(d.getTime() > histLastClastered + HIST_CLASTERING_UPDATE_RATE_MS) {
    histLastClastered = d.getTime();
    const bigIntArray = updatedLocalHistory.split(" ").filter(item => item.length).map(item => BigInt("0x" + item));
    const claster = (array: bigint[]) => {
      //sort by rowid
      const sortedByIdArray = array.sort((a, b) => {
        // [49467 057459 0 0805 048n]
        const idStart = 14;
        const idEnd = 8;
        const aString = a.toString();
        const aLength = aString.length;
        const bString = b.toString();
        const bLength = bString.length;
        const idA = aString.substring(aLength - idStart, aLength - idEnd);
        const idB = bString.substring(bLength - idStart, bLength - idEnd);
        return parseInt(idA) - parseInt(idB);
      });
      //remove some
      const clasteredArray = sortedByIdArray.filter((cur, i, arr) => {
        if(!i || i === arr.length - ONE) {
          return true;
        }
        // [49467 057459 0 0805 048n]
        const idStart = 14;
        const idEnd = 8;
        const statusStart = 8;
        const statusEnd = 7;
        const ttlStart = 3;
        const ttlEnd = 0;
        const timeStart = ZERO; //without string length
        const timeEnd = 14;

        const curString = String(cur);
        const curLength = curString.length;
        const curStatusIndex = curString.substring(curLength - statusStart, curLength - statusEnd);
        const curTTL = curString.substring(curLength - ttlStart, curLength - ttlEnd);
        const curId = curString.substring(curLength - idStart, curLength - idEnd);
        const curTime = parseInt(curString.substring(timeStart, curLength - timeEnd));
        
        //we checked for i > 0 before
        const prvString = String(arr[i - ONE]);
        const prvLength = prvString.length;
        const prvStatusIndex = prvString.substring(prvLength - statusStart, prvLength - statusEnd);
        const prvTTL = prvString.substring(prvLength - ttlStart, prvLength - ttlEnd);
        const prvId = prvString.substring(prvLength - idStart, prvLength - idEnd);
        const prvTime = parseInt(prvString.substring(timeStart, prvLength - timeEnd));
        const date = new Date();
        const t = date.getHours() * HOURinSECONDS + date.getMinutes() * MINUTEinSECONDS + date.getSeconds();
        if(
          // IF same status and same ttl
          curStatusIndex === prvStatusIndex
          && curTTL === prvTTL
          && curId === prvId
          // AND previus is closer then claster size
          && Math.abs(prvTime - curTime) < config.historyClasteringSizeMIN * MINUTEinSECONDS
          // AND time is bigger then config.clasteringStart
          && curTime < t - config.historyClasteringStartMIN * MINUTEinSECONDS
        ) {
          // THEN remove self
          //return false if needed to remove
          return false;
        }
        return true;
      });
      
      //sort by time
      const sortedByTimeArray = clasteredArray.sort((a, b) => {
        // [49467 057459 0 0805 048n]
        const timeStart = 0;//without length
        const timeEnd = 14;
        const aString = a.toString();
        const aLength = aString.length;
        const bString = b.toString();
        const bLength = bString.length;
        const timeA = parseInt(aString.substring(timeStart, aLength - timeEnd));
        const timeB = parseInt(bString.substring(timeStart, bLength - timeEnd));
        return timeA - timeB;
      });
      return sortedByTimeArray;
    };
    //converting back to hex and joining to one string
    const clasteredHist = claster(bigIntArray).map(item => item.toString(SIXTEEN)).join(" ");
    //save localy once again  
    localStorage.setItem(`hist_${fileName}`, clasteredHist);
  }else{
    //saving localy without clastering
    localStorage.setItem(`hist_${fileName}`, updatedLocalHistory);
  }
  
  
  //saving history
  if(d.getTime() > histLastUpadte + HIST_UPDATRE_RATE_MS) {
    histLastUpadte = d.getTime();
    await writeFile(fileName, localStorage.getItem(`hist_${fileName}`) || "");
    //removing other days data
    for(let i = ZERO; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if(key && key.slice(ZERO, FIVE) === "hist_" && !key.replace("hist_", "").includes(fileName)) {
        localStorage.removeItem(key);
      }
    }
  }
  return lineHex;
};