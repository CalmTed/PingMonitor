import React, { FC } from "react";
import styled from "styled-components";
import { ActionType, StateModel, StoreModel } from "src/models";
import { customHook } from "src/utils/customHook";
import { LANG_CODE, getT } from "src/utils/lang";
import Toast from "./Toast";
import Alert from "./Alert";
import { Menu } from "./Menu";
import Prompt from "./Prompt";
import { ConfigModal } from "./ConfigModal";
import { getConfig } from "src/utils/config";
import { View } from "./View";

interface AppInterface {
  state: StateModel
  dispatch: (action: ActionType) => void
}

const AppStyle = styled.div``; 

const App: FC<AppInterface> = ({state, dispatch}) => {
  const {toastData, showToast, alertData, showAlert, promptData, showPrompt} = customHook();
  const config = getConfig();
  const store: StoreModel = {
    state: state,
    config: config,
    t: getT(config.language || LANG_CODE.en),
    dispatch, 
    showToast,
    showAlert,
    showPrompt
  };
  // const changeLang = () => {
  //   dispatch({
  //     name: ACTION_NAME.APP_SET_LANG_CODE,
  //     payload: state.langCode === LANG_CODE.ua ? LANG_CODE.en : LANG_CODE.ua
  //   });
  // };
  // const handleClick = () => {
  //   const one = 1;
  //   setTimeout(async () => {
  //     const addr = (document.querySelector(".hostAddr") as HTMLInputElement).value;
  //     const p = await ping(addr);
  //     const zero = 0;
  //     if(!p) {
  //       return;
  //     }
  //     await writeHist({
  //       time: p.time,
  //       addressIP: p.address,
  //       dellay: p.avgDellay,
  //       ttl: p.ttl || zero
  //     });
  //     const one = 1, two = 2;
  //     const d = new Date();
  //     const fileName = `${d.getFullYear()}${addZero(String(d.getMonth() + one), two)}${addZero(String(d.getDate()), two)}.txt`;
  //     const hist = await readHistDay(fileName);
      
      
  //   }, one);
  // };
  // const askForLanguage = () => {
  //   store.showPrompt("Оберіть мову", "Select language", PROMPT_TYPES.select, () => {
  //     store.showToast("English by default", "pic_pingMonitor");
  //   }, (result) => {
  //     dispatch({
  //       name: ACTION_NAME.APP_SET_LANG_CODE,
  //       payload: result === LANG_CODE.ua ? LANG_CODE.ua : LANG_CODE.en
  //     });
  //   }, 
  //   "Select",
  //   [
  //     {
  //       label: "English",
  //       value: LANG_CODE.en
  //     },
  //     {
  //       label: "Українська",
  //       value: LANG_CODE.ua
  //     }
  //   ]
  //   );
  // };
  return <AppStyle>
    <View store={store}/>
    <Menu store={store}/>
    <ConfigModal store={store} />
    <Prompt 
      isShown={promptData.isShown}
      header={promptData.header}
      text={promptData.text}
      type={promptData.type}
      oncancel={promptData.oncancel}
      onconfirm={promptData.onconfirm}
      confirmButtonTitle={promptData.confirmButtonTitle}
      options={promptData.options} 
    />
    {alertData.isShown &&
    <Alert 
      isShown={alertData.isShown}
      header={alertData.header}
      text={alertData.text}
      oncancel={alertData.oncancel}
      onconfirm={alertData.onconfirm}
    />}
    <Toast
      isShown={toastData.isShown}
      text={toastData.text}
      icon={toastData.icon}
    />
  </AppStyle>;
};

export default App;