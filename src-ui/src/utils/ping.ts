import { Command } from "@tauri-apps/api/shell";
import { HOST_STATE, HOURinSECONDS, MINUTEinSECONDS, ONE, TWO, ZERO } from "src/constants";
import addZero from "./addZero";

const defaultPacketsNumber = 1;
const defaultPacketsSize = 32;

export interface parseResultInterface {
  status: HOST_STATE
  address: string
  time: number
  avgDellay: number
  ttl: number
  date: string
}

const ping = async (address: string, packetsNumber = defaultPacketsNumber, packetsSize = defaultPacketsSize) => {
  //-a for resolving addreses to ip
  //-n number of packets
  //-l size of packet
  const cmd = new Command("pinging", ["-4", "-a", "-n", `${packetsNumber}`, "-l", `${packetsSize}`, address.trim()]);
  const parseResult:(arg: string) => parseResultInterface = str => {
    const date = new Date();
    const time = date.getHours() * HOURinSECONDS + date.getMinutes() * MINUTEinSECONDS + date.getSeconds();
    //date for the case if paused at 12AM on ONE day and unpaused next day at 10AM(before) it cant "get busy"
    const dateString = `${date.getFullYear()}${addZero((date.getMonth() + ONE).toString(), TWO)}${addZero(date.getDate().toString(), TWO)}`;
    //ERROR
    if(isNaN(parseInt(str.replace(address, "").replace(/[^0-9]/g, "")))) {
      return {
        status: HOST_STATE.error,
        address: "0.0.0.0",
        time: time,
        avgDellay: 0,
        ttl: 0,
        date: dateString
      };
    }
    const ttlStart = 4;
    const ttlEnd = 7;
    const defaultDellay = 0;
    const addrIndexStart = str.indexOf("[") + ONE;
    const addrIndexEnd = str.indexOf("]");
    const addr = str.substring(addrIndexStart, addrIndexEnd);
    const dellayLastIndex = str.lastIndexOf("=");
    const avgDellay = parseInt(str.substring(dellayLastIndex, str.length).replace(/\D+/g, "")) || defaultDellay;
    const tllLastIndex = str.lastIndexOf("TTL=");
    const ttl = parseInt(str.substring(tllLastIndex + ttlStart, tllLastIndex + ttlEnd).replace(/\D+/g, "")) || ZERO;
    const isTimeout = str.replace(address, "").includes("100%");
    if(isTimeout) {
      return {
        status: HOST_STATE.timeout,
        address: "0.0.0.0",
        time: time,
        avgDellay: 0,
        ttl: 0,
        date: dateString
      };
    }
    return {
      status: HOST_STATE.online,
      address: addr === "::1" ? "0.0.0.0" : addr,
      time: time,
      avgDellay: avgDellay,
      ttl: ttl,
      date: dateString
    };
  };
  const dirtyResult = (await cmd.execute()).stdout;
  const clearResult = parseResult(dirtyResult);
  return clearResult;
};

export default ping;