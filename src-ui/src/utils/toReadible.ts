import { HOURinSECONDS, MINUTEinSECONDS, TWO, ZERO } from "src/constants";
import { StoreModel } from "src/models";
import addZero from "./addZero";

export const toReadibleDuration = (num = ZERO, store: StoreModel) => {
  const hours = Math.floor(num / HOURinSECONDS);
  const minutes = Math.floor((num - hours * HOURinSECONDS) / MINUTEinSECONDS);
  const seconds = Math.floor((num - hours * HOURinSECONDS - minutes * MINUTEinSECONDS));
  if(hours) {
    return `${addZero(String(hours), TWO)}:${addZero(String(minutes), TWO)}:${addZero(String(seconds), TWO)}`;
  }
  if(minutes) {
    return `${addZero(String(minutes), TWO)}:${addZero(String(seconds), TWO)}`;
  }
  return `${seconds}${store.t("s")}`;
};

export const toReadibleTime = (num = ZERO) => {
  const hours = Math.floor(num / HOURinSECONDS);
  const minutes = Math.floor((num - hours * HOURinSECONDS) / MINUTEinSECONDS);
  const seconds = Math.floor((num - hours * HOURinSECONDS - minutes * MINUTEinSECONDS));
  return `${addZero(String(hours), TWO)}:${addZero(String(minutes), TWO)}:${addZero(String(seconds), TWO)}`;
};