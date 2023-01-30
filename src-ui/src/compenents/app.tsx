import React, { FC } from "react";
import styled from "styled-components";
import { ActionType, StateModel, StoreModel } from "src/models";
import { customHook } from "src/utils/customHook";
import { LANG_CODE, getT } from "src/utils/lang";
import Toast from "./Toast";
import Alert from "./Alert";
import { Menu } from "./Menu";
import Prompt from "./Prompt";
import { ACTION_NAME } from "src/utils/reducer";
import { PROMPT_TYPES } from "src/constants";
import { t } from "@tauri-apps/api/event-2a9960e7";

interface AppInterface {
  state: StateModel
  dispatch: (action: ActionType) => void
}

const AppStyle = styled.div`

`; 

const App: FC<AppInterface> = ({state, dispatch}) => {
  const {toastData, showToast, alertData, showAlert, promptData, showPrompt} = customHook();
  const store: StoreModel = {
    state: state,
    t: getT(state.langCode),
    dispatch, 
    showToast,
    showAlert,
    showPrompt
  };
  toastData;
  alertData;
  promptData;
  const changeLang = () => {
    dispatch({
      name: ACTION_NAME.APP_SET_LANG_CODE,
      payload: state.langCode === LANG_CODE.ua ? LANG_CODE.en : LANG_CODE.ua
    });
  };
  const handleClick = () => {
    const one = 1;
    setTimeout(async () => {
      // const addr = (document.querySelector(".hostAddr") as HTMLInputElement).value;
      // const p = await ping(addr);
      // const zero = 0;
      // if(!p) {
      //   return;
      // }
      // await writeHist({
      //   time: p.time,
      //   addressIP: p.address,
      //   dellay: p.avgDellay,
      //   ttl: p.ttl || zero
      // });
      // const one = 1, two = 2;
      // const d = new Date();
      // const fileName = `${d.getFullYear()}${addZero(String(d.getMonth() + one), two)}${addZero(String(d.getDate()), two)}.txt`;
      // const hist = await readHistDay(fileName);
      
      
    }, one);
  };
  const askForLanguage = () => {
    store.showPrompt("Select language", "Оберіть мову", PROMPT_TYPES.select, () => {
      store.showToast("English by default");
    }, (result) => {
      dispatch({
        name: ACTION_NAME.APP_SET_LANG_CODE,
        payload: result === LANG_CODE.ua ? LANG_CODE.ua : LANG_CODE.en
      });
    }, 
    "Select",
    [
      {
        label: "English",
        value: LANG_CODE.en
      },
      {
        label: "Українська",
        value: LANG_CODE.ua
      }
    ]
    );
  };
  return <AppStyle>
    <Menu store={store}/>
    {/* <input className="hostAddr" type="text" defaultValue="google.com"/> */}
    <div></div>
    <div onClick={askForLanguage}>[lang {store.state.langCode}]</div>
    <div onClick={handleClick}>[click]</div>
    <Toast isShown={toastData.isShown} text={toastData.text}></Toast>
    <Alert isShown={alertData.isShown} header={alertData.header} text={alertData.text} oncancel={alertData.oncancel} onconfirm={alertData.onconfirm}/>
    <Prompt isShown={promptData.isShown} header={promptData.header} text={promptData.text} type={promptData.type} oncancel={promptData.oncancel} onconfirm={promptData.onconfirm} confirmButtonTitle={promptData.confirmButtonTitle} options={promptData.options} />
  </AppStyle>;
};

export default App;