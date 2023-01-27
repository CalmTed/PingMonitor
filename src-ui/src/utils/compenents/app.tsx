import React, { FC } from "react";
import styled from "styled-components";
import { ActionType, StateModel, StoreModel } from "../../models";
import { customHook } from "src/utils/customHook";

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
  return <AppStyle>
    {store.state.version}
    {toastData.isShown && <span>{toastData.text}</span>}
    {alertData.isShown && <span>alert shown</span>}
    {promptData.isShown && <span>prompt shown</span>}

  </AppStyle>;
};

export default App;