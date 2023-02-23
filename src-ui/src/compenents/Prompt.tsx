import React, {FC, useState} from "react";
import { PROMPT_TYPES } from "src/constants";
import { Option } from "src/models";
import styled from "styled-components";
import Button from "./Button";
import Select from "./Select";
import Input from "./Input";
import { Word } from "src/utils/lang";

interface PromptComponentModel {
  isShown: boolean
  header: string
  text: string
  type: PROMPT_TYPES
  oncancel: () => void
  onconfirm : (arg: string) => void
  t: (w: Word) => string
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
    }
    .inputs{
      padding: 0.5em 0;
      width: 100%;
      display: flex;
      justify-content: center;
      
    }  
    .buttons{
      height: min-content;
      padding-top: 0.5em;
      width: 100%;
      display: flex;
      justify-content: center;
      gap: 0.4em;
      .botton{
      }
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


const Prompt: FC<PromptComponentModel> = ({isShown, header, text, type, oncancel, onconfirm, t, options, confirmButtonTitle}) => {
  const defaultOption = typeof options === "object" ? options[0].value : "";
  const [selectValue, setSelectValue] = useState(defaultOption);
  if(selectValue === "" && selectValue !== defaultOption) {
    setSelectValue(defaultOption);
  }
  const [inputValue, setInputValue] = useState("");
  const handleConfirm = (value = true) => {
    let retVlaue = "";
    switch(type) {
    case PROMPT_TYPES.confirm:
      retVlaue = String(value);
      break;
    case PROMPT_TYPES.select:
      retVlaue = selectValue || "";
      break;
    case PROMPT_TYPES.text:
      retVlaue = inputValue || "";
      break;
    }
    !value && type !== PROMPT_TYPES.confirm ? oncancel() : onconfirm(retVlaue);
  };
  return <PromptStyle
    className={`${ isShown ? " shown" : ""}`}
  >
    <div className="backdrop" onClick={oncancel}></div>
    <div className="container bc">
      <div className="header">{header}</div>
      <div className="text">{text}</div>
      { type === PROMPT_TYPES.select && 
        ( 
          <div className="inputs">
            <Select value={selectValue || ""} options={options || []} onChange={(newValue) => { setSelectValue(newValue); } }/>
          </div>
        )
      }
      { type === PROMPT_TYPES.text && 
        ( 
          <div className="inputs">
            <Input value={inputValue} onChange={ (newValue) => { setInputValue(newValue); }} onSubmit={ () => handleConfirm(true)} />
          </div>
        )
      }
      <div className="buttons">
        <Button onClick={() => handleConfirm(false)} title={t("cancel")} type="secondary"/>
        <Button onClick={() => handleConfirm(true)} title={confirmButtonTitle ? confirmButtonTitle : "OK"} type="primary"/>
      </div>
    </div>
  </PromptStyle>;
};

export default Prompt;