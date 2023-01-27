const en = {
  lang: "english"
};

export type Word = keyof typeof en; 

export enum LANG_CODE{
  ua = "ua",
  en = "en"
}

export const WORDS = {
  ua: {},
  en: {}
};