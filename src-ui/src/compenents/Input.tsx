import React, { FC} from "react";
import styled from "styled-components";

interface InputModel {
  value: string
  onChange: (newValue: string) => void
  onSubmit?: (newValue: string) => void
  disabled?: boolean
  css?: React.CSSProperties
  placeholder?: string
  tabIndex?: number
}

const InputStyle = styled.input`
--input-color: var(--blue);
border-radius: var(--radius-button);
padding: 0.6em 1.2em;
cursor: pointer;
font-size: 1em;
border: 0;
background: transparent;
color: var(--text-color);
border: 0.1em solid var(--text-color);
&:active{
  transform: scale(0.99);
}
&:disabled{
  cursor: initial;
  opacity: 0.7;
}
`;

const Input: FC<InputModel> = ({value, onChange, onSubmit, disabled, css, placeholder, tabIndex}) => {
  const handleKeyUp = (e: React.KeyboardEvent) => {
    const value = (e.target as HTMLInputElement).value;
    if(e.code === "Enter") {
      onSubmit ? onSubmit(value) : null;
    }
  };
  return (
    <InputStyle
      className={`${disabled ? " disabled" : ""}`}
      onChange={(e) => { disabled ? null : onChange(e.target.value); }}
      onKeyUp={(e) => { disabled ? null : handleKeyUp(e); }}
      value={value}
      disabled={disabled}
      style={css}
      placeholder={placeholder}
      tabIndex={tabIndex}
    />
  );
};

export default Input;