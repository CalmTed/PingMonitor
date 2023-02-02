import React, { FC } from "react";
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
    backdrop-filter: blur(3px);
  }
  .container{
    top: 5vh;
    left: 10vw;
    width: calc(80vw - 4em);
    height: calc(90vh - 2em);
    border-radius: var(--radius);
    padding: 1em 2em;
    overflow-y: auto;
  }
  &.shown{
    .backdrop,.container{
      opacity: 1;
      visibility: visible;
    }
  }
`;

export const Modal: FC<ModalModel> = ({isShown, onClose, children}) => {
  return <ModalStyle className={isShown ? "shown" : ""}>
    <div className="backdrop" onClick={onClose}></div>
    <div className="container bc">
      {children}
    </div>
  </ModalStyle>;
};