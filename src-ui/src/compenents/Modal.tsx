import React, { FC } from "react";
import { ONE } from "src/constants";
import styled from "styled-components";

interface ModalModel{
  isShown: boolean
  onClose: () => void
  children: React.ReactNode
}

const ModalStyle = styled.div`
  
  .backdrop,.container{
    position: fixed;
    opacity: 0;
    visibility: hidden;
    transition: var(--transition);
  }
  .backdrop{
    cursor: pointer;
    background: var(--backdrop-bg);
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(0px);
    :focus{
      outline-offset: -0.3em;
    }
  }
  .container{
    top: 5vh;
    left: 10vw;
    width: calc(80vw - 4em);
    height: calc(90vh - 2em);
    border-radius: var(--radius);
    padding: 1em 2em;
    overflow-y: auto;
    transform: translateY(1em);
  }
  &.shown{
    .backdrop,.container{
      opacity: 1;
      visibility: visible;
      transform: translateY(0em);
    }
  }
`;

export const Modal: FC<ModalModel> = ({isShown, onClose, children}) => {
  const handleMouseUp = (e: React.KeyboardEvent) => {
    if(e.code === "Enter") {
      onClose();
    }
  };
  return <ModalStyle className={isShown ? "shown" : ""}>
    <div className="backdrop" onClick={onClose} onKeyUp={handleMouseUp} tabIndex={isShown ? ONE : undefined}></div>
    <div className="container bc">
      {children}
    </div>
  </ModalStyle>;
};