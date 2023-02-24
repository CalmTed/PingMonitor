import React, { FC } from "react";
import { StoreModel } from "src/models";
import { CMDataModel, CMItemModel } from "src/utils/contextMenuHook";
import styled from "styled-components";
import { Icon } from "./Icon";
import { HUNDRED, TWO, ZERO } from "src/constants";


interface CMModel{
  store: StoreModel
  data: CMDataModel
}

const ContextMenuStyle = styled.div`
  position: fixed;
  opacity: 0;
  visibility: hidden;
  transform: scale(0.9);
  transition: all .1s;
  &.shown{
    visibility: visible;
    opacity: 1;
    transform: scale(1);
  }
  &.shown.uptop{
    transform: scale(1) translate(0, -100%);
  }
  &.shown.southpal{
    transform: scale(1) translate(-100%, 0);
  }
  &.shown.uptop.southpal{
    transform: scale(1) translate(-100%, -100%);
  }
  & .contextMenuItem{
    padding: 0.5em 1em;
    display: flex;
    align-items: center;
    justyfy-content: start;
    cursor: pointer;
    &.hiddenItem{
      opacity: 0;
      :focus{
        opacity: 1;
      }
    }
    :focus{
      outline-offset: -0.2em;
    }
    :first-child{
      border-radius: var(--radius) var(--radius) 0 0;
    }
    :nth-last-child(2){
      border-radius: 0 0 var(--radius) var(--radius);
    }
    :hover{
      background-color: var(--bc-bg-hover);
    }
  }
`;

export const ContextMenu: FC<CMModel> = ({store, data}) => {
  const handleClick = (item: CMItemModel) => {
    store.hideContextMenu();
    item.onClick();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if(e.code === "Enter") {
      (e.target as HTMLElement).click();
    }
  };
  const contextEl = document.querySelector(".contextmenu");
  const pageEl = document.querySelector("body");
  const uptop = data.top + (contextEl?.clientHeight || ZERO) > (pageEl?.clientHeight || HUNDRED);
  const southpal = data.left + (contextEl?.clientWidth || ZERO) > (pageEl?.clientWidth || HUNDRED);
  return <ContextMenuStyle
    className={`contextmenu ${data.isShown ? " shown" : ""}${uptop ? " uptop" : ""}${southpal ? " southpal" : ""}`}
    style={{
      "top" : data.top,
      "left" : data.left
    } as React.CSSProperties}
  >
    {data.items.map(item => {
      return <div 
        key={item.label}
        onClick={() => { handleClick(item); }}
        className="bc contextMenuItem"
        onKeyDown={handleKeyDown}
        tabIndex={TWO + store.state.rows.length}
      > 
        { item.icon &&  <Icon icon={item.icon}/>}
        { store.t(item.label) }
      </div>;
    })
    } 
    <div 
      onClick={store.hideContextMenu}
      className="bc contextMenuItem hiddenItem"
      onKeyDown={handleKeyDown}
      tabIndex={TWO + store.state.rows.length}
    > 
      { <Icon icon={"ico_cross"}/>}
      { store.t("contextClose") }
    </div>
  </ContextMenuStyle>;
};