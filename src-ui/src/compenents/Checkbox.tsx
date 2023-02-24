import React, { FC } from "react";
import styled from "styled-components";

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  &.disabled{
    cursor: initial;
    opacity: 0.7;
  }
  & .checkbox{
    margin-right: 0.5em;
  }
`;

export const CheckboxStyle = styled.span`
  --input-color: var(--blue);
  border-radius: var(--radius-button);
  cursor: pointer;
  border: 0;
  align-items: center;
  display: flex;
  transition: var(--transition);
  background: var(--bc-bg-hover);
  width: 2.5em;
  height: 1.5em;

  :after{
    content: "";
    width: 1.1em;
    border-radius: 50%;
    aspect-ratio: 1;
    background: var(--text-color);
    margin: 0.2em;
    transition: var(--transition);
  }
  &.checked{
    background: var(--button-bg);
    :after{
      transform: translate(1em, 0);
      background: var(--text-color);
    }
  }
  &:not(.disabled):active{
    transform: scale(0.97);
  }
  &.disabled{
    cursor: initial;
    opacity: 0.7;
  }
`;

export interface CheckboxProps {
  checked: boolean
  onClick: () => void
  title?: string
  disabled?: boolean
  tabIndex?: number
}
const Checkbox: FC<CheckboxProps> = ({ onClick, checked, title, disabled = false, tabIndex }) => {
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if(e.code === "Enter") {
      (e.target as HTMLInputElement).click();
    }
  };
  return (
    <CheckboxLabel 
      className={ (disabled ? " disabled" : "") }
      onClick={ () => { !disabled ? onClick() : null; }}
      tabIndex={tabIndex}
      title={title}
      onKeyUp={handleKeyUp}
    >
      <CheckboxStyle
        className={ "checkbox " + (checked ? " checked" : "") + (disabled ? " disabled" : "") }
        onClick={ () => { !disabled ? onClick() : null; } }
        onKeyUp={handleKeyUp}
      />
    </CheckboxLabel>
  );
};

export default Checkbox;