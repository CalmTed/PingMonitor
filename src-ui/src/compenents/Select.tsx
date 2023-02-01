import React, { FC} from "react";
import { Option } from "src/models";
import styled from "styled-components";

interface SelectModel {
  value: string;
  options: Option[] 
  onChange: (newValue:string) => void
}

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
}
.selectTitle span{
  width: 100%;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}
.selectTitle::after{
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
.selectTitle:focus:after{
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
  transform: scale(0);
  opacity: 0;
  transition: var(--transition);
  transform-origin: top;
  max-height: 30vh;
  overflow-y: auto;
  z-index: 9000;
}
.selectTitle:focus + .selectOptions{
  transform: scale(1);
  opacity: 1;
}
.selectOption{
  color: #fff;
  width: 100%;
  padding: 0.6em 1.6em;
  margin: 0;
  transition: var(--transition);
  max-width: 10em;
  overflow: hidden;
  text-overflow: ellipsis;
}
.selectOption.selected{
  font-weight: bolder;
}
.selectOption:hover{
  cursor: pointer;
  background-color: var(--bc-bg-hover);
}
`;

const Select: FC<SelectModel> = ({value, options, onChange}) => {
  const handleSelectSet = (newValue: string) => {
    if(newValue !== value) {
      onChange(newValue);
    }
  };
  return (
    <SelectStyle className="select">
      <button className="input input-outline selectTitle"><span>{ options.find(option => option.value === value)?.label || value}</span></button>
      <div className="selectOptions">
        {
          options.map(({label, value}) => {
            return (<p key={value} className={"selectOption" + ((value === value || label === value) ? " selected" : "")} onMouseDown={() => { handleSelectSet(value); }} >{label}</p>);
          })
        }
      </div>
    </SelectStyle>
  );
};

export default Select;