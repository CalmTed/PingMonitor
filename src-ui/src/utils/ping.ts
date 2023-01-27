import { Command } from "@tauri-apps/api/shell";

const defaultPacketsNumber = 1;
const defaultPacketsSize = 32;

interface parseResultInterface {
  time: number
  avgDellay: number
  ttl: number | null
}

const ping = async (address: string, packetsNumber = defaultPacketsNumber, packetsSize = defaultPacketsSize) => {
  //-a for resolving addreses to ip
  //-n number of packets
  //-l size of packet
  const cmd = new Command("pinging", ["-a", "-n", `${packetsNumber}`, "-l", `${packetsSize}`, address]);
  const parseResult:(arg: string) => parseResultInterface = str => {
    const date = new Date();
    const HANDRED = 100;
    const ttlStart = 4;
    const ttlEnd = 7;
    const defaultDellay = 0;
    console.debug(str);
    const dellayLastIndex = str.lastIndexOf("=");
    const avgDellay = parseInt(str.substring(dellayLastIndex, str.length).replace(/\D+/g, "")) || defaultDellay;
    const tllLastIndex = str.lastIndexOf("TTL=");
    const ttl = parseInt(str.substring(tllLastIndex + ttlStart, tllLastIndex + ttlEnd).replace(/\D+/g, "")) || null;
    return {
      time: date.getMinutes() * HANDRED + date.getSeconds(),
      avgDellay: avgDellay,
      ttl: ttl
    };
  };
  const dirtyResult = (await cmd.execute()).stdout;
  const clearResult = parseResult(dirtyResult);
  return clearResult;
};

export default ping;