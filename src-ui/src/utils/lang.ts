const en = {
  lang: "english",
  titleMenu: "Menu",
  titleAdd: "Add row",
  titleSettings: "Open settings",
  titleExport: "Export rows",
  titleImport: "Import rows",
  titleFullscreen: "Toggle fullscreen",

  menuItemSettings: "Settings",
  menuItemExport: "Export",
  menuItemImport: "Import",

  headerSettings: "Settings",
  configGroupGeneral: "General",
  configGroupRow: "Row",
  configLanguage: "Language",
  configView: "View",
  configViewTiles: "Tiles",
  configViewTimeline: "Timeline",
  configItemDefaultRow: "Default row",
  configItemDefaultRowRule: "Default row rule",
  configItemTimeToAlarm: "Time to alarm activation",
  configUnmuteOnOnline: "Unmute row on getting online",
  configTimeToAlarm: "Offline time before alarm activation",
  configHideAddress: "Hide address",

  contextMenuPlay: "Start",
  contextMenuPause: "Pause",
  contextMenuRemove: "Remove",
  contextMenuMute: "Mute",
  contextMenuUnmute: "Unmute",
  contextMenuEdit: "Edit"
};

const ua: typeof en = {
  lang: "українська",
  titleMenu: "Меню",
  titleAdd: "Додати хост",
  titleSettings: "Відкрити налаштування",
  titleExport: "Експортувати налаштування",
  titleImport: "Імпортувати налаштування",
  titleFullscreen: "Повноекраний режим",

  menuItemSettings: "Налаштування",
  menuItemExport: "Ексопрт",
  menuItemImport: "Імпорт",

  headerSettings: "Налаштування",
  configGroupGeneral: "Загальні",
  configGroupRow: "Рядок",
  configLanguage: "Мова",
  configView: "Вид",
  configViewTiles: "Блоки",
  configViewTimeline: "Часова лінія",
  configItemDefaultRow: "Рядок за замовченням",
  configItemDefaultRowRule: "Правило нового рядка",
  configItemTimeToAlarm: "Час до спрацювання сирени",
  configUnmuteOnOnline: "Увімкнути звук рядка при відновленні зв'язку",
  configTimeToAlarm: "Час до спрацювання сирени",
  configHideAddress: "Приховати адресу",

  contextMenuPlay: "Розпочати",
  contextMenuPause: "Призупинити",
  contextMenuRemove: "Видалити",
  contextMenuMute: "Вимкнути звук",
  contextMenuUnmute: "Увімкнути звук",
  contextMenuEdit: "Редагувати"
};

const fr: typeof en = {
  lang: "Française",
  titleMenu: "Menu",
  titleAdd: "Ajouter une rangée",
  titleSettings: "Ouvrir les paramètres",
  titleExport: "Exporter des lignes",
  titleImport: "Importer des lignes",
  titleFullscreen: "Toggle fullscreen",

  menuItemSettings: "Les paramètres",
  menuItemExport: "Exporter",
  menuItemImport: "Importer",

  headerSettings: "Les paramètres",
  configGroupGeneral: "Général",
  configGroupRow: "Ligne",
  configLanguage: "Langue",
  configView: "View",
  configViewTiles: "Tiles",
  configViewTimeline: "Timeline",
  configItemDefaultRow: "Ligne par défaut",
  configItemDefaultRowRule: "Règle de ligne par défaut",
  configItemTimeToAlarm: "Délai d'activation de l'alarme",
  configUnmuteOnOnline: "Activer le son de la ligne lorsque la connexion est rétablie",
  configTimeToAlarm: "Offline time before alarm activation",
  configHideAddress: "Hide address",

  
  contextMenuPlay: "Start",
  contextMenuPause: "Pause",
  contextMenuRemove: "Remove",
  contextMenuMute: "Mute",
  contextMenuUnmute: "Unmute",
  contextMenuEdit: "Edit"
};

export type Word = keyof typeof en; 

export enum LANG_CODE{
  ua = "ua",
  en = "en",
  fr = "fr"
}

export const WORDS = {
  ua: ua,
  en: en,
  fr: fr
};

export const getT: (lang: LANG_CODE) => (word: Word) => string = (lang) => {
  return (word: Word) => {
    const words = WORDS[lang];
    return words[word] ||  word;
  };
};