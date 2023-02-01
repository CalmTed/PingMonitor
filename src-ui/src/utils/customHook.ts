import { useState } from "react";
import { IconName } from "src/compenents/Icon";
import { PROMPT_TYPES, TOAST_TIMEOUT } from "src/constants";
import { Option } from "src/models";


export const customHook = () => {
  const [toastData, setToastData] = useState({
    isShown: false,
    text: "",
    icon: undefined as IconName | undefined,
    timeoutId: 0
  });
  const [alertData, setAlertData] = useState({
    isShown: false,
    header: "",
    text: "",
    oncancel: () => { return; },
    onconfirm: () => { return; }
  });
  const [promptData, setPromptData] = useState({
    isShown: false,
    header: "",
    text: "",
    type: PROMPT_TYPES.confirm,
    oncancel: () => { return; },
    onconfirm: (arg: string) => { arg; },
    confirmButtonTitle: undefined  as string | undefined,
    options: undefined as Option[] | undefined
  });
  const showToast = (text: string, icon?: IconName) => {
    toastData.isShown ? clearTimeout(toastData.timeoutId) : null;
    const toID = setTimeout(() => {
      setToastData({
        isShown: false,
        text: toastData.text,
        icon: toastData.icon,
        timeoutId: toastData.timeoutId
      });
    }, TOAST_TIMEOUT);
    setToastData({
      isShown: true,
      text,
      icon,
      timeoutId: toID
    });
  };
  const showAlert = (header:string, text: string, oncancel: () => void, onconfirm: () => void) => {
    const hideAlert = () => {
      setAlertData({
        isShown: false,
        header: alertData.header,
        text: alertData.text,
        oncancel: alertData.oncancel,
        onconfirm: alertData.onconfirm
      });  
    };
    setAlertData({
      isShown: true,
      header,
      text,
      oncancel: () => { 
        hideAlert();
        oncancel();
      },
      onconfirm: () => { 
        hideAlert();
        onconfirm();
      }
    });
  };
  const showPrompt = (header:string, text: string, type: PROMPT_TYPES, oncancel: () => void, onconfirm: (arg: string) => void,  confirmButtonTitle?: string, options?: Option[]) => {
    const hidePrompt = () => {
      setPromptData({
        isShown: false,
        header: promptData.header,
        text: promptData.text,
        type: promptData.type,
        oncancel: promptData.oncancel,
        onconfirm: promptData.onconfirm,
        options: promptData.options,
        confirmButtonTitle: promptData.confirmButtonTitle
      });
    };
    setPromptData({
      isShown: true,
      header,
      text,
      type,
      oncancel: () => {
        hidePrompt();
        oncancel();
      },
      onconfirm: (ret: string) => {
        hidePrompt();
        onconfirm(ret);
      },
      options,
      confirmButtonTitle
    });
  };
  return {toastData,
    showToast,
    alertData,
    showAlert,
    promptData,
    showPrompt
  };
};