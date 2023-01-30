import React, {FC} from "react";
import styled from "styled-components";

interface AlertComponentModel {
  isShown: boolean
  header: string
  text: string
  oncancel: () => void
  onconfirm : () => void
}

const AlertStyle = styled.div`

  & .backdrop,& .container{
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    position: fixed;
  }
  & .backdrop{
    background: var(--backdrop-bg);
    top: 0;
    height: 100vh;
    left: 0;
    width: 100vw;
    backdrop-filter: blur(3px);
    cursor: pointer;
  }
  & .container{
    width: 18em;
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
      transform: translate(0px);
    }
  }
`;


const Alert: FC<AlertComponentModel> = ({isShown, header, text, oncancel, onconfirm}) => {
  return <AlertStyle
    className={`bc${ isShown ? " shown" : ""}`}
  >
    <div className="backdrop" onClick={oncancel}></div>
    <div className="container bc">
      <div className="header">{header}</div>
      <div className="text">{text}</div>
      <div className="buttons">
        <div onClick={onconfirm}>[OK]</div>
      </div>
    </div>
  </AlertStyle>;
};

export default Alert;