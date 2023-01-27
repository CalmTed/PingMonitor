import React, { FC } from "react";
import styled from "styled-components";
import { ActionType, StateModel, StoreModel } from "../models";
import { customHook } from "src/utils/customHook";
import { ACTION_NAME } from "src/utils/reducer";
import { LANG_CODE } from "src/utils/lang";

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
    dispatch, 
    showToast,
    showAlert,
    showPrompt
  };
  toastData;
  alertData;
  promptData;
  const handleClick = () => {
    dispatch({
      name: ACTION_NAME.APP_SET_LANG_CODE,
      payload: state.langCode === LANG_CODE.ua ? LANG_CODE.en : LANG_CODE.ua
    });
  };
  return <AppStyle onClick={handleClick}>{store.state.langCode}</AppStyle>;
};

export default App;