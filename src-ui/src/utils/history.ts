import { HOST_STATE } from "src/constants";
import addZero from "./addZero";
import { readFile, writeFile } from "./fs";

export const getHistFileList: () => Promise<string[]> = async () => {
  //lookup for a file
  console.warn("TODO HERE");
  return ["20230128.txt"];
};

export const readHistDay: (arg: string) => Promise<{addreses: string[], data:string[][]} | null> = async (fileName) => {
  //[hhmmss25525525525510001001
  //read a file
  const fileContent = await readFile(fileName);
  if(!fileContent) {
    return null;
  }
  //convert hex to numbers
  const fileBigIntArray = fileContent?.split(" ").filter(item => item.length).map(item => BigInt("0x" + item));
  //get all addreses
  const addresses = new Set();
  const zero = 0;
  const substrStart =  20;//from the end
  const substrEnd = 8;
  fileBigIntArray.forEach(item => {
    const string = item.toString();
    addresses.add(string.substring(string.length - substrStart, string.length - substrEnd));
  });
  //filter by addreses
  const data: string[][] = [];
  fileBigIntArray.forEach(item => {
    const string = item.toString();
    const address = string.substring(string.length - substrStart, string.length - substrEnd);
    const index = [...addresses].indexOf(address);
    if(!data[index]) {
      data[index] = [];
    }
    const noAddrString = string.substring(zero, string.length - substrStart) + string.substring(string.length - substrEnd, string.length);
    data[index].push(noAddrString);
  });
  return {
    addreses: [...addresses] as string[],
    data
  };
};
interface writeHistModel{
  time: number
  addressIP: string
  state: HOST_STATE
  dellay: number
  ttl: number
}




export const writeHist: (arg: writeHistModel) => Promise<string> = async ({time, addressIP, state, dellay, ttl}) => {
  const one = 1, sixteen = 16, two = 2;
  const targetPartsNumber = 4;
  const targetPartLength = 3;
  const minNumber = 0;
  const targetTTLlength = 3;
  const targetDellayLength = 4;
  
  const addressToNumber: (addr: string) => string | null = (addr) => {
    const parts = addr.split(".");
    if(parts.length < targetPartsNumber || Number.isNaN(parseInt(parts.join(""))) || parseInt(parts.join("")) < minNumber) {
      return null;
    }
    return parts.map(item => addZero(item, targetPartLength)).join("");
  };
  //convert address to number
  const addresLine = addressToNumber(addressIP);

  //convert host state to number
  const stateNum = Object.values(HOST_STATE).indexOf(state);

  //convert to hex
  const line = `${time}${addresLine}${stateNum}${addZero(String(dellay), targetDellayLength)}${addZero(String(ttl), targetTTLlength)}`;
  const lineNum = BigInt(line);
  const lineHex = lineNum.toString(sixteen);
  //append to file
  const d = new Date();
  const fileName = `${d.getFullYear()}${addZero(String(d.getMonth() + one), two)}${addZero(String(d.getDate()), two)}.txt`;
  await writeFile(fileName, lineHex + " ", true);
  return lineHex;
};