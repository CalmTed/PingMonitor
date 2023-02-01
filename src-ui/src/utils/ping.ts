import { Command } from "@tauri-apps/api/shell";
import { HOST_STATE } from "src/constants";

const defaultPacketsNumber = 1;
const defaultPacketsSize = 32;

export interface parseResultInterface {
  status: HOST_STATE
  address: string
  time: number
  avgDellay: number
  ttl: number | null
}

const ping = async (address: string, packetsNumber = defaultPacketsNumber, packetsSize = defaultPacketsSize) => {
  //-a for resolving addreses to ip
  //-n number of packets
  //-l size of packet
  const cmd = new Command("pinging", ["-4", "-a", "-n", `${packetsNumber}`, "-l", `${packetsSize}`, address]);
  const parseResult:(arg: string) => parseResultInterface | null = str => {
    const date = new Date();
    const ttlStart = 4;
    const ttlEnd = 7;
    const defaultDellay = 0;
    const one = 1, hour = 3600, minute = 60;
    console.debug(str);
    const addrIndexStart = str.indexOf("[") + one;
    const addrIndexEnd = str.indexOf("]");
    const addr = str.substring(addrIndexStart, addrIndexEnd);
    const dellayLastIndex = str.lastIndexOf("=");
    const avgDellay = parseInt(str.substring(dellayLastIndex, str.length).replace(/\D+/g, "")) || defaultDellay;
    const tllLastIndex = str.lastIndexOf("TTL=");
    const ttl = parseInt(str.substring(tllLastIndex + ttlStart, tllLastIndex + ttlEnd).replace(/\D+/g, "")) || null;
    console.log("NO TIMEOUNT HERE YET");
    if(!addr) {
      return {
        status: HOST_STATE.error,
        address: "",
        time: date.getHours() * hour + date.getMinutes() * minute + date.getSeconds(),
        avgDellay: Infinity,
        ttl: ttl || null
      };
    }
    return {
      status: HOST_STATE.online,
      address: addr === "::1" ? "0.0.0.0" : addr,
      time: date.getHours() * hour + date.getMinutes() * minute + date.getSeconds(),
      avgDellay: avgDellay,
      ttl: ttl
    };
  };
  const dirtyResult = (await cmd.execute()).stdout;
  const clearResult = parseResult(dirtyResult);
  return clearResult;
};

export default ping;