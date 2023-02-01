import React, { FC } from "react";
import { VIEW_TYPE } from "src/constants";
import { StoreModel } from "src/models";
import styled from "styled-components";
import { TileRow } from "./Row";

const ViewStyle = styled.div`
  display: grid;
  width: 100vw;
  gap: 0.5em;
`;

export const View: FC<{store: StoreModel}> = ({store}) => {
  return <ViewStyle className={`view${VIEW_TYPE.tiles ? " tiles" : " timeline"}`}>
    {store.config.view === VIEW_TYPE.tiles && <>
      {store.state.rows.map(row => <TileRow key={row.id} store={store} row={row}></TileRow>)}
    </>}
  </ViewStyle>;
};
