import { useState } from "react";


export const customHook = () => {
  const [toastData, setToastData] = useState({
    isShown: false,
    text: ""
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
    oncancel: () => { return; },
    onconfirm: (arg: string) => { arg; }
  });
  const showToast = (text: string) => {
    setToastData({
      isShown: true,
      text
    });
    //set settimeout to hide in 5 sec
    return;
  };
  const showAlert = (header:string, text: string, oncancel: () => void, onconfirm: () => void) => {
    setAlertData({
      isShown: true,
      header,
      text,
      oncancel,
      onconfirm
    });
  };
  const showPrompt = (header:string, text: string, oncancel: () => void, onconfirm: (arg: string) => void) => {
    setPromptData({
      isShown: true,
      header,
      text,
      oncancel,
      onconfirm
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