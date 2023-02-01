import React, { FC, useEffect, useState } from "react";
import { VIEW_TYPE } from "src/constants";
import { StoreModel } from "src/models";
import styled from "styled-components";
import { TileRow } from "./Row";

const ViewStyle = styled.div`
  width: calc(100vw - 1em);
  height: calc(100vh - 1em);
  display: grid;
  grid-auto-rows: 200px;
  grid-auto-flow: dense;
  --columns-number: 1;
  --rows-number: 1;
  grid-template-columns: repeat(var(--columns-number), calc(100% / var(--columns-number)));
  grid-template-rows: repeat(var(--rows-number), calc(100% / var(--rows-number)));
  overflow-y: auto;
`;

export const View: FC<{store: StoreModel}> = ({store}) => {
  const getViewStyle: () => React.CSSProperties = () => {
    const one = 1, hundred = 100, zoomFactor = one / (store.state.zoom / hundred);
    const body = document.body;
    const width = body.clientWidth * zoomFactor;
    const height = body.clientHeight * zoomFactor;
    //stringing number for eslint constants rule
    const sizes = ["0", "480", "560", "709", "840", "1080", "1120", "1680", "2160", "10000"];
    const cols = sizes.filter(size => width > parseInt(size)).length;
    const rows = sizes.filter(size => height > parseInt(size)).length;
    return {
      "--columns-number": cols,
      "--rows-number": rows
    } as React.CSSProperties;
  };
  const [size, setSize] = useState(getViewStyle());
  useEffect(() => {
    window.addEventListener("resize", checkSize, {passive: false});
    return () => {
      window.removeEventListener("resize", checkSize);
    };
  });
  const checkSize = () => {
    const styleOnRender = getViewStyle();
    if(JSON.stringify(styleOnRender) !== JSON.stringify(size)) {
      setSize(getViewStyle());
    }
  };
  checkSize();
  return <ViewStyle
    className={`view${VIEW_TYPE.tiles ? " tiles" : " timeline"}`}
    style={size}
  >
    {store.config.view === VIEW_TYPE.tiles && <>
      {store.state.rows.map(row => <TileRow key={row.id} store={store} row={row}></TileRow>)}
    </>}
  </ViewStyle>;
};
