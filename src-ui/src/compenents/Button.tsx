import React, {FC} from "react";
import styled from "styled-components";
import { Icon, IconName } from "./Icon";

interface ButtonModel{
  onClick: () => void
  title:string
  type?: "primary" | "secondary" | "nobg"
  disabled?: boolean
  icon?: IconName
  css?: React.CSSProperties
}

const ButtonStyle = styled.button`
  --input-color: var(--button-bg);
  border-radius: var(--radius-button);
  padding: 0.6em 1.2em;
  cursor: pointer;
  font-size: 1em;
  border: 0;
  max-width: 13em;
  max-height: 3.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color);
  align-items: center;
  display: flex;
  transition: all .2s;

  &.button-primary{
    color: var(--text-color);
    background: var(--input-color);
  }
  &.button-secondary{
    border: 2px solid var(--input-color);
    background: transparent;
  }
  &.button-nobg{
    color: var(--input-color);
    border: none;
    background: transparent;
  }

  &:not(.disabled):active{
    transform: scale(0.97);
  }
  &.disabled{
    cursor: initial;
    opacity: 0.7;
  }

  & .buttonIcon{
    --icon-color: var(--text-second);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 0.5em;
    height: 1.5em;
    transition: var(--transition);
  }
`;

const Button: FC<ButtonModel> = ({onClick, title, type = "primary", disabled = false, icon, css }) => {
  return (
    <ButtonStyle
      className={ "button" + (type ? ` button-${type}` : "") + (disabled ? " disabled" : "") }
      disabled={ disabled }
      onClick={ onClick }
      style={css}
    >
      {icon && <Icon icon={icon} />}
      {title && <>{title}</>}
    </ButtonStyle>
  );
};

export default Button;
