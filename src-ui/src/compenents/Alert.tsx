import React, {FC, useEffect} from "react";
import styled from "styled-components";
import Button from "./Button";
import { Word } from "src/utils/lang";
import { ONE } from "src/constants";

const AlertStyle = styled.div`
  & .backdrop,& .container{
    position: fixed;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
  }
  & .backdrop{
    background: var(--backdrop-bg);
    top: 0;
    height: 100vh;
    left: 0;
    width: 100vw;
    backdrop-filter: blur(2.5px);
    cursor: pointer;
    :focus{
      outline-offset: -0.5em;
    }
  }
  & .container{
    width: 22em;
    min-height: 8em;
    max-height: 16em;
    left: calc(50vw - 10em);
    top: calc(50vh - 5em); 
    border-radius: var(--radius);
    padding: 1em;
    display: flex;
    flex-wrap: wrap;
    .header{
      font-size: 120%;
      font-weight: bold;
      padding-bottom: 0.5em;
      width: 100%;
      height: min-content;
      max-height: 1.9em;
      overflow: auto;
    } 
    .text{
      width: 100%;
      height: 100%;
      max-height: 10em;
      overflow-y: auto;
      word-break: break-all;
      user-select: text;
    }    
    .buttons{
      height: min-content;
      padding-top: 0.5em;
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
  &.shown{
    .backdrop,
    .container{  
      transition: var(--transition);
      opacity: 1;
      visibility: visible;
      transform: translateY(0px);
    }
  }
`;

interface AlertComponentModel {
  isShown: boolean
  header: string
  text: string
  oncancel: () => void
  onconfirm : () => void
  t: (w: Word) => string
}

const Alert: FC<AlertComponentModel> = ({isShown, header, text, oncancel, onconfirm, t}) => {
  useEffect(() => {
    if(isShown) {
      (document.querySelector(".alert .buttons .button") as HTMLElement)?.focus();
    }
  });
  return <AlertStyle
    className={`alert${ isShown ? " shown" : ""}`}
  >
    <div className="backdrop" onClick={oncancel} onKeyDown={(e) => { e.code === "Enter" ? (e.target as HTMLElement).click() : null; }} tabIndex={isShown ? ONE : undefined}></div>
    <div className="container bc">
      <div className="header">{header}</div>
      <div className="text">{text}</div>
      <div className="buttons">
        <Button onClick={onconfirm} title={t("ok")} type="primary" tabIndex={isShown ? ONE : undefined}/>
      </div>
    </div>
  </AlertStyle>;
};

export default Alert;