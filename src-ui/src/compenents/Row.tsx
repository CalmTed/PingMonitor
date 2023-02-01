import React, { FC } from "react";
import { RowModel, StoreModel } from "src/models";
import { ACTION_NAME } from "src/utils/reducer";
import styled from "styled-components";
import Input from "./Input";
import Button from "./Button";
import { Icon } from "./Icon";
import Select from "./Select";
import { ICONS } from "src/utils/iconsData";



interface TileRowModel{
  store: StoreModel
  row: RowModel
}

const TileRowStyle = styled.div`
  width: 20em;
  height: 10em;
  display: flex;
  align-items: center;
  justify-content: center;
  tranition: var(--transition);
  border-radius: var(--radius);
  border-width 0.2em;
  border-style: solid;
  border-color: transparent;
  :hover{
    //transform: scale(0.9)
  }
  &.online:not(.busy){
    border-color: var(--green);
  }
  &.timeout:not(.busy), &.error:not(.busy){
    border-color: var(--red);
  }
`;

export const TileRow: FC<TileRowModel> = ({store, row}) => {
  const handleDelete = () => {
    store.dispatch({
      name: ACTION_NAME.ROWS_REMOVE,
      payload: [row.id]
    });
  };
  const handleChange = (prop: keyof RowModel, newVal: string) => {
    store.dispatch({
      name: ACTION_NAME.ROWS_SET_PARAM,
      payload: {
        rowsId: [row.id],
        param: prop,
        value: newVal
      }
    });
  };
  const picOptions = Object.keys(ICONS).filter(pic => pic.includes("pic_")).map(pic => {
    return {
      label: pic,
      value: pic
    };
  });
  return <TileRowStyle className={`row tileRow bc ${row.lastPing.status}`}>
    <Icon icon={row.picture} css={{width:"8em"}} />
    {row.lastPing.status}
    <Select value={row.picture} options={picOptions} onChange={(newVal) => handleChange("picture", newVal)}></Select>
    {/* <Button title="" type="nobg" onClick={handleDelete} icon="ico_trash"/> */}
  </TileRowStyle>;
};