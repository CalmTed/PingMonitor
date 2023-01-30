import React, {FC} from "react";
import { PROMPT_TYPES } from "src/constants";
import { Option } from "src/models";
import styled from "styled-components";

interface PromptComponentModel {
  isShown: boolean
  header: string
  text: string
  type: PROMPT_TYPES
  oncancel: () => void
  onconfirm : (arg: string) => void
  options?: Option[]
  confirmButtonTitle?: string
}

const PromptStyle = styled.div`

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
    backdrop-filter: blur(2.5px);
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
    .inputs{

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


const Prompt: FC<PromptComponentModel> = ({isShown, header, text, type, oncancel, onconfirm, options, confirmButtonTitle}) => {
  const handleConfirm = (value = true) => {
    let retVlaue = "";
    switch(type) {
    case PROMPT_TYPES.confirm:
      retVlaue = String(value);
      break;
    case PROMPT_TYPES.select:
      retVlaue = (document.querySelector(".inputs select") as HTMLSelectElement).value || "";
      break;
    case PROMPT_TYPES.text:
      retVlaue = (document.querySelector(".inputs input") as HTMLInputElement).value || "";
      break;
    }
    console.log(value, type, !value && type !== PROMPT_TYPES.confirm);
    !value && type !== PROMPT_TYPES.confirm ? oncancel() : onconfirm(retVlaue);
  };
  return <PromptStyle
    className={`bc${ isShown ? " shown" : ""}`}
  >
    <div className="backdrop" onClick={oncancel}></div>
    <div className="container bc">
      <div className="header">{header}</div>
      <div className="text">{text}</div>
      { type === PROMPT_TYPES.select && 
        ( 
          <div className="inputs">
            <select>
              {options && options.map(option => 
                <option key={option.value} value={option.value}>{option.label}</option> 
              )}
            </select>
          </div>
        )
      }
      { type === PROMPT_TYPES.text && 
        ( 
          <div className="inputs">
            <input type="text" onKeyUp={(e) => { e.code === "Enter" ? handleConfirm() : null; }} />
          </div>
        )
      }
      <div className="buttons">
        <div onClick={() => handleConfirm(false)}>[Cancel]</div>
        <div onClick={() => handleConfirm(true)}>[{confirmButtonTitle ? confirmButtonTitle : "OK"}]</div>
      </div>
    </div>
  </PromptStyle>;
};

export default Prompt;