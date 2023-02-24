import React, { FC} from "react";
import { Option } from "src/models";
import styled from "styled-components";

const SelectStyle = styled.div`
.input{
  --input-color: var(--blue);
  border-radius: var(--radius-button);
  padding: 0.6em 1.2em;
  cursor: pointer;
  font-size: 1em;
  border: 0;
  background: transparent;
  color: var(--text-color);
  border: 0.1em solid var(--text-color);
}
.input:active{
  transform: scale(0.97);
}
.input:disabled{
  cursor: initial;
  opacity: 0.7;
}
.selectTitle{
  padding-right: 1.8em;
  max-width: 13em;
  max-height: 3.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  span{
    width: 100%;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
  }
  :after{
    content: '';
    position: absolute;
    transform: translate(0.6em, 0.3em) rotate(45deg);
    width: 6px;
    height: 6px;
    border: 2px solid var(--text-color);
    border-left: 0;
    border-top: 0;
    transition: var(--transition);
  }
}
.selectTitle:focus:after, .selectOptions:focus-within + .selectTitle:after{
  transform: translate(0.6em, 0.3em) rotate(-135deg);
}
.selectOptions{
  position: absolute;
  height: fit-content;
  border-radius: var(--radius-button);
  overflow: hidden;
  background: var(--bc-bg);
  backdrop-filter: blur(2.5px);
  box-shadow: var(--shadow);
  transform: scale(0.7);
  opacity: 0;
  visibility: hidden;
  transition: var(--transition);
  transform-origin: top;
  max-height: 30vh;
  overflow-y: auto;
  z-index: 9000;
  width: max-content;
  &.uptop{
    transform: scale(0) translate(0, calc(-100% - 3em));
    transform-origin: bottom;
  }
}
.selectTitle:focus + .selectOptions, .selectOptions:focus-within{
  transform: scale(1);
  opacity: 1;
  visibility: visible;
}
.selectTitle:focus + .selectOptions.uptop, .selectOptions.uptop:focus-within{
  transform: scale(1) translate(0, calc(-100% - 3em));
  opacity: 1;
  visibility: visible;
}
.selectOption{
  color: #fff;
  padding: 0.6em 1.6em;
  margin: 0;
  max-width: 10em;
  overflow: hidden;
  text-overflow: ellipsis;
  &.selected{
    font-weight: bolder;
  }
  :hover{
  cursor: pointer;
  background-color: var(--bc-bg-hover);
  }
  :focus{
    outline-offset: -0.2em;
  }
}
`;

interface SelectModel {
  value: string;
  options: Option[] 
  onChange: (newValue:string) => void
  styles?: React.CSSProperties
  optionsUptop?: boolean
  tabIndex?: number
}

const Select: FC<SelectModel> = ({value, options, onChange, styles, optionsUptop, tabIndex}) => {
  const selectValue = value;
  const handleSelectSet = (newValue: string) => {
    if(newValue !== selectValue) {
      onChange(newValue);
    }
  };
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if(e.code === "Enter") {
      (e.target as HTMLElement).click();
    }
  };
  return (
    <SelectStyle className="select">
      <button className="input input-outline selectTitle" style={styles} tabIndex={tabIndex}><span>{ options.find(option => option.value === selectValue)?.label || selectValue}</span></button>
      <div className={`selectOptions${optionsUptop ? " uptop" : ""}`}>
        {
          options.filter(item => item.value).map(({label, value}) => {
            return (<p key={value} className={"selectOption" + ((value === selectValue || label === selectValue) ? " selected" : "")} onClick={() => { value ? handleSelectSet(value) : null; }} onKeyUp={handleKeyUp} tabIndex={tabIndex}>{label}</p>);
          })
        }
      </div>
    </SelectStyle>
  );
};

export default Select;