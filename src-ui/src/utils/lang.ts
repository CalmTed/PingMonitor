const en = {
  lang: "english",
  titleMenu: "Menu",
  titleAdd: "Add row",
  titleSettings: "Open settings",
  titleExport: "Export rows",
  titleImport: "Import rows",

  menuItemSettings: "Settings",
  menuItemExport: "Export",
  menuItemImport: "Import"

};

const ua: typeof en = {
  lang: "українська",
  titleMenu: "Меню",
  titleAdd: "Додати хост",
  titleSettings: "Відкрити налаштування",
  titleExport: "Експортувати налаштування",
  titleImport: "Імпортувати налаштування",

  menuItemSettings: "Налаштування",
  menuItemExport: "Ексопрт",
  menuItemImport: "Імпорт"
};

export type Word = keyof typeof en; 

export enum LANG_CODE{
  ua = "ua",
  en = "en"
}

export const WORDS = {
  ua: ua,
  en: en
};

export const getT: (lang: LANG_CODE) => (word: Word) => string = (lang) => {
  return (word: Word) => {
    const words = WORDS[lang];
    return words[word] ||  word;
  };
};