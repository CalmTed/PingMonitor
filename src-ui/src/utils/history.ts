import { HOST_STATE } from "src/constants";
import addZero from "./addZero";
import { readFile, writeFile } from "./fs";

export const getHistFileList: () => Promise<string[]> = async () => {
  //lookup for a file
  console.warn("TODO HERE");
  return ["20230128.txt"];
};

export const readHistDay: (arg?: string) => Promise<{rowIds: string[], data:string[][]} | null> = async (fileName) => {
  //hhmmss99999910001001
  if (!fileName) {
    const date = new Date(), one = 1, two = 2;
    fileName = `${date.getFullYear()}${addZero(String(date.getMonth() + one), two)}${addZero(String(date.getDate()), two)}.txt`;
  }
  //read a file
  const fileContent = await readFile(fileName);
  if(!fileContent) {
    return null;
  }
  //convert hex to numbers
  const fileBigIntArray = fileContent?.split(" ").filter(item => item.length).map(item => BigInt("0x" + item));
  //get all addreses
  const rowIds = new Set();
  const zero = 0;
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
    const noAddrString = string.substring(zero, string.length - substrStart) + string.substring(string.length - substrEnd, string.length);
    data[index].push(noAddrString);
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
  const one = 1, sixteen = 16, two = 2;
  const targetTTLlength = 3;
  const targetDellayLength = 4;
  const rowIdTargetLenght = 6;
  //convert host state to number
  const stateNum = Object.values(HOST_STATE).indexOf(state);

  //convert to hex
  const line = `${time}${addZero(String(rowId), rowIdTargetLenght)}${stateNum}${addZero(String(dellay), targetDellayLength)}${addZero(String(ttl), targetTTLlength)}`;
  const lineNum = BigInt(line);
  const lineHex = lineNum.toString(sixteen);
  //append to file
  const d = new Date();
  const fileName = `${d.getFullYear()}${addZero(String(d.getMonth() + one), two)}${addZero(String(d.getDate()), two)}.txt`;
  await writeFile(fileName, lineHex + " ", true);
  return lineHex;
};