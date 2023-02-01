import React, { FC } from "react";
import styled from "styled-components";

export interface CheckboxProps {
  checked: boolean
  onClick: () => void
  title?: string
  disabled?: boolean
}
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



const Checkbox: FC<CheckboxProps> = ({ onClick, checked, title, disabled = false }) => {
  return (
    <CheckboxLabel 
      className={ (disabled ? " disabled" : "") }
      onClick={ () => { !disabled ? onClick() : null; }}
      tabIndex={10}
      title={title}
    >
      <CheckboxStyle
        className={ "checkbox " + (checked ? " checked" : "") + (disabled ? " disabled" : "") }
        onClick={ () => { !disabled ? onClick() : null; } }
      />
    </CheckboxLabel>
  );
};

export default Checkbox;