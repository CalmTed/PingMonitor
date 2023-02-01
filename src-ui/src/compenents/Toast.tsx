import React, {FC} from "react";
import styled from "styled-components";
import { Icon, IconName } from "./Icon";

interface ToastComponentModel {
  isShown: boolean
  text: string
  icon?: IconName
}

const ToastStyle = styled.div`
  position: fixed;
  right: -2em;
  opacity: 0;
  transition: var(--transition);
  padding: 0.7em 1.4em;
  border-radius: var(--radius);
  bottom: 2em;
  display: flex;
  align-items: center;
  gap: 0.5em;
  &.shown{
    right: 2em;
    opacity: 1;
  }
`;

const Toast: FC<ToastComponentModel> = ({isShown, text, icon}) => {
  return <ToastStyle
    className={`bc${ isShown ? " shown" : ""}`}
  >
    {icon && <Icon icon={icon}/>}
    {text}
  </ToastStyle>;
};

export default Toast;