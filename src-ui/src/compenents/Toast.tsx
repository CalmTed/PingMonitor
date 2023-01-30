import React, {FC} from "react";
import styled from "styled-components";

interface ToastComponentModel {
  isShown: boolean
  text: string
}

const ToastStyle = styled.div`
  position: fixed;
  right: -2em;
  opacity: 0;
  transition: var(--transition);
  padding: 0.7em 1.4em;
  border-radius: var(--radius);
  bottom: 2em;
  &.shown{
    right: 2em;
    opacity: 1;
  }
`;

const Toast: FC<ToastComponentModel> = ({isShown, text}) => {
  return <ToastStyle
    className={`bc${ isShown ? " shown" : ""}`}
  >
    {text}
  </ToastStyle>;
};

export default Toast;