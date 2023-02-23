const en = {
  lang: "english",
  titleMenu: "Menu",
  titleAdd: "Add row",
  titleSettings: "Open settings",
  titleExport: "Export rows",
  titleImport: "Import rows",
  titleFullscreen: "Toggle fullscreen",
  titlePauseAll: "Pause all",
  titleUnalarmAll: "Turn all alarms off",

  menuItemSettings: "Settings",
  menuItemExport: "Export",
  menuItemImport: "Import",

  headerSettings: "Settings",
  headerEditRow: "Edit row",

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
  configTimeToAlarm: "Offline time before alarm activation(SEC)",
  configHideAddress: "Hide address",
  configHistoryClasteringStartMIN: "Time to start clastering history (MIN)",
  configHistoryClasteringSizeMIN: "Size to a history claster (MIN)",
  minigraphMaxTimeMIN: "Scale of row minigraph (MIN)",

  promptDeletedRowsInHistHeader: "There are some deleted rows in history",
  promptDeletedRowsInHistText: "Do you want to recreate them? (name and address are not stored in history)",
  promptWhatDoYouWhantToExport: "What do you want to export?",
  promptWhatDoYouWhantToImport: "What do you what to import?",
  optionHistJSON: "Ping history in json",
  optionConfig: "Configuration",
  optionState: "Rows state",

  toastExported: "Exported",
  toastExportError: "Export Error!",
  toastImportError: "Import Error!",
  toastConfigImported: "Configuration imported!",
  toastStateImported: "State imported!",

  contextMenuPlay: "Start",
  contextMenuPause: "Pause",
  contextMenuRemove: "Remove",
  contextMenuMute: "Mute",
  contextMenuUnmute: "Unmute",
  contextMenuEdit: "Edit",
  contextMenuUnalarm: "Turn alarm off",
  contextMenuUnselect: "Unselect",
  contextMenuSelect: "Select",

  rowTitlePicture: "Picture",
  rowTitleName: "Name",
  rowTitleAddress: "Address",
  rowTitleSize: "Size",
  rowTitleColor: "Picture",
  rowTitleUTS: "Update time strategy",

  colorGray: "Gray",
  colorRed: "Red",
  colorOrange: "Orange",
  colorYellow: "Yellow",
  colorGreen: "Green",
  colorBlue: "Blue",
  colorPurple: "Purple",
  colorPink: "Pink",
  colorWhite: "White",

  s: "s",
  ms: "ms",
  multiple: "[multiple]",
  cancel: "Сancel"
};

const ua: typeof en = {
  lang: "українська",
  titleMenu: "Меню",
  titleAdd: "Додати хост",
  titleSettings: "Відкрити налаштування",
  titleExport: "Експортувати налаштування",
  titleImport: "Імпортувати налаштування",
  titleFullscreen: "Повноекраний режим",
  titlePauseAll: "Призупинити всі",
  titleUnalarmAll: "Виключити сирени для всіх рядків",

  menuItemSettings: "Налаштування",
  menuItemExport: "Ексопрт",
  menuItemImport: "Імпорт",

  headerSettings: "Налаштування",
  headerEditRow: "Налаштування строки",

  configGroupGeneral: "Загальні",
  configGroupRow: "Рядок",
  configLanguage: "Мова",
  configView: "Вид",
  configViewTiles: "Блоки",
  configViewTimeline: "Часова лінія",
  configItemDefaultRow: "Рядок за замовченням",
  configItemDefaultRowRule: "Правило нового рядка",
  configItemTimeToAlarm: "Час до спрацювання сирени(СЕК)",
  configUnmuteOnOnline: "Увімкнути звук рядка при відновленні зв'язку",
  configTimeToAlarm: "Час до спрацювання сирени",
  configHideAddress: "Приховати адресу",
  configHistoryClasteringStartMIN: "Час початку кластеризації історії (ХВ)",
  configHistoryClasteringSizeMIN: "Розмір одного кластеру історії (ХВ)",
  minigraphMaxTimeMIN: "Час відображення мініграфу рядка (ХВ)",

  
  promptDeletedRowsInHistHeader: "В історії є строки які були видалені",
  promptDeletedRowsInHistText: "Відтвирити ті строки? (Ім'я, адреса у історії не зберігаються)",
  promptWhatDoYouWhantToExport: "Що саме потрібно експортувати?",
  promptWhatDoYouWhantToImport: "Що саме потрібно імпортувати?",
  optionHistJSON: "Історію у json форматі",
  optionConfig: "Налаштування",
  optionState: "Стан строк",

  toastExported: "Експортовано",
  toastExportError: "Помилка експортування!",
  toastImportError: "Помилка імпортування!",
  toastConfigImported: "Налаштування імпортовано!",
  toastStateImported: "Стан рядків імпортовано!",

  contextMenuPlay: "Розпочати",
  contextMenuPause: "Призупинити",
  contextMenuRemove: "Видалити",
  contextMenuMute: "Вимкнути звук",
  contextMenuUnmute: "Увімкнути звук",
  contextMenuEdit: "Редагувати",
  contextMenuUnalarm: "Виключити сирену",
  contextMenuUnselect: "Зняти виділення",
  contextMenuSelect: "Виділити",
  
  rowTitlePicture: "Зображення",
  rowTitleName: "Ім'я",
  rowTitleAddress: "Адреса",
  rowTitleSize: "Розмір",
  rowTitleColor: "Колір",
  rowTitleUTS: "Стратегія оновлення",

  colorGray: "Сірий",
  colorRed: "Червоний",
  colorOrange: "Поморанчевий",
  colorYellow: "Жовтий",
  colorGreen: "Зелений",
  colorBlue: "Синій",
  colorPurple: "Фіолетовий",
  colorPink: "Рожевий",
  colorWhite: "Білий",

  s: "с",
  ms: "мс",
  multiple: "[різні значення]",
  cancel: "Відмінити"
};

const fr: typeof en = {
  lang: "Française",
  titleMenu: "Menu",
  titleAdd: "Ajouter une rangée",
  titleSettings: "Ouvrir les paramètres",
  titleExport: "Exporter des lignes",
  titleImport: "Importer des lignes",
  titleFullscreen: "Toggle fullscreen",
  titlePauseAll: "Pause all",
  titleUnalarmAll: "Turn all alarms off",

  menuItemSettings: "Les paramètres",
  menuItemExport: "Exporter",
  menuItemImport: "Importer",

  headerSettings: "Les paramètres",
  headerEditRow: "Edit row",

  configGroupGeneral: "Général",
  configGroupRow: "Ligne",
  configLanguage: "Langue",
  configView: "View",
  configViewTiles: "Tiles",
  configViewTimeline: "Timeline",
  configItemDefaultRow: "Ligne par défaut",
  configItemDefaultRowRule: "Règle de ligne par défaut",
  configItemTimeToAlarm: "Délai d'activation de l'alarme(SEC)",
  configUnmuteOnOnline: "Activer le son de la ligne lorsque la connexion est rétablie",
  configTimeToAlarm: "Offline time before alarm activation",
  configHideAddress: "Hide address",
  configHistoryClasteringStartMIN: "Time to start clastering history (MIN)",
  configHistoryClasteringSizeMIN: "Size to a history claster (MIN)",
  minigraphMaxTimeMIN: "Scale of row minigraph (MIN)",

  
  promptDeletedRowsInHistHeader: "There are some deleted rows in history",
  promptDeletedRowsInHistText: "Do you want to recreate them? (Name and address could not be restored)",
  promptWhatDoYouWhantToExport: "What do you want to export?",
  promptWhatDoYouWhantToImport: "What do you what to import?",
  optionHistJSON: "Ping history in json",
  optionConfig: "Configuration",
  optionState: "Rows state",

  toastExported: "Exported",
  toastExportError: "Export Error!",
  toastImportError: "Import Error!",
  toastConfigImported: "Configuration imported!",
  toastStateImported: "State imported!",

  contextMenuPlay: "Start",
  contextMenuPause: "Pause",
  contextMenuRemove: "Remove",
  contextMenuMute: "Mute",
  contextMenuUnmute: "Unmute",
  contextMenuEdit: "Edit",
  contextMenuUnalarm: "Turn alarm off",
  contextMenuUnselect: "Unselect",
  contextMenuSelect: "Select",
  
  rowTitlePicture: "Picture",
  rowTitleName: "Name",
  rowTitleAddress: "Address",
  rowTitleSize: "Size",
  rowTitleColor: "Picture",
  rowTitleUTS: "Update time strategy",

  colorGray: "Gray",
  colorRed: "Red",
  colorOrange: "Orange",
  colorYellow: "Yellow",
  colorGreen: "Green",
  colorBlue: "Blue",
  colorPurple: "Purple",
  colorPink: "Pink",
  colorWhite: "White",

  s: "s",
  ms: "ms",
  multiple: "[multiple]",
  cancel: "Сancel"
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