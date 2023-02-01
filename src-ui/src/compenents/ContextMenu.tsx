import React, { FC } from "react";
import { StoreModel } from "src/models";
import { CMDataModel, CMItemModel } from "src/utils/contextMenuHook";
import styled from "styled-components";
import { Icon } from "./Icon";


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
  & .contextMenuItem{
    padding: 0.5em 1em;
    display: flex;
    align-items: center;
    justyfy-content: start;
    cursor: pointer;
    :first-child{
      border-radius: var(--radius) var(--radius) 0 0;
    }
    :last-child{
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
  return <ContextMenuStyle
    className={`contextmenu ${data.isShown ? " shown" : ""}`}
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
      >
        { item.icon &&  <Icon icon={item.icon}/>}
        { store.t(item.label) }
      </div>;
    })
    }
  </ContextMenuStyle>;
};