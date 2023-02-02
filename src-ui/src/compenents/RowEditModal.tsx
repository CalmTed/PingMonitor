import React, { FC } from "react";
import { Modal } from "./Modal";
import { RowModel, StoreModel } from "src/models";
import { ACTION_NAME } from "src/utils/reducer";
import Input from "./Input";
import { ICONS } from "src/utils/iconsData";
import Select from "./Select";
import { Icon } from "./Icon";
import styled from "styled-components";
import { HOST_STATE, ROW_COLOR, ROW_SIZE } from "src/constants";
import { Word } from "src/utils/lang";

interface RowEditModalModel{
  store: StoreModel
}

const RowEditModalStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  label{
    gap: 0.5em;
    margin: 0.5em 0;
    width: 100%;  
    display: flex;
    align-items: center;
    justify-content: start;
    .icon{
      width: 2.5em;
    }
    .sizeVisual{
      border: 0.1em solid var(--text-color);
      opacity: 0.5;
      border-radius: var(--radius);
      --u: 1em;
      --w: var(--u);
      --h: var(--u);
      &.${ROW_SIZE.x2h}{
        --w: calc(var(--u) * 2);
        --h: var(--u);
      }
      &.${ROW_SIZE.x2v}{
        --w: var(--u);
        --h: calc(var(--u) * 2);
      }
      &.${ROW_SIZE.x4}{
        --w: calc(var(--u) * 2);
        --h: calc(var(--u) * 2);
      }
      &.${ROW_SIZE.x6}{
        --w: calc(var(--u) * 3);
        --h: calc(var(--u) * 2);
      }
      width: var(--w);
      height: var(--h);
    }
    
    .circle{
      border-radius: 50%;
      width: 1.5em;
      aspect-ratio: 1;
    }
    &.indent{
      margin-left: 1.5em;
    }
  }
`;

export const RowEditModal:FC<RowEditModalModel> = ({store}) => {
  const handleClose = () => {
    store.dispatch({
      name: ACTION_NAME.ROWS_TOGGLE_EDIT,
      payload: null
    });
  };
  const handleParamChange: (param: keyof RowModel, value: string | boolean) => void = (param, value) => {
    store.dispatch({
      name: ACTION_NAME.ROWS_SET_PARAM,
      payload: {
        rowsId: (store.state.rowEditing || []),
        param,
        value
      }
    });
  };
  const getCommonRowsData: (ids: number[] | null) => RowModel | null = (ids) => {
    if(ids === null) {
      return null;
    }
    const ret: RowModel = store.state.rows.filter(row => {
      if(ids.includes(row.id)) {
        return row;
      }
    })[0];//just showing one for now
    return ret;
  };
  const k = 1000;
  const rowsData = getCommonRowsData(store.state.rowEditing);
  const picOptions = Object.keys(ICONS).filter(pic => pic.includes("pic_")).map(pic => {
    return {
      label: pic,
      value: pic
    };
  });
  const handleUTSChange:(state: HOST_STATE, value: string) => void = (state, value) => {
    const min = 1;
    const max = 99;
    let num = parseInt(value);
    if(!rowsData) {
      return;
    }
    if(num > max) {
      num = max;
    }
    if(num < min) {
      num = min;
    }
    const newUTS = {
      ...rowsData.updateTimeStrategy,
      [state]: num * k
    };
    store.dispatch({
      name: ACTION_NAME.ROWS_SET_UTS,
      payload: {
        rowsId: [rowsData.id],
        value: newUTS
      }
    });
  };
  const colorOptions = Object.entries(ROW_COLOR).map(e => {
    return {
      label: store.t(`color${e[0]}` as Word),
      value: e[1]
    };
  });
  const sizeOptions = Object.entries(ROW_SIZE).map(e => {
    return {
      label: e[0],
      value: e[1]
    };
  });
  return <Modal isShown={store.state.rowEditing !== null} onClose={handleClose}>
    <h1>{store.t("headerEditRow")}</h1>
    {rowsData && <RowEditModalStyle>
      <label>
        {store.t("rowTitlePicture")}:
        <Select value={rowsData.picture} options={picOptions} onChange={(newVal) => { handleParamChange("picture", newVal); }}/>
        <Icon icon={rowsData.picture}/>
      </label>
      <label>
        {store.t("rowTitleName")}:
        <Input value={rowsData.label} onChange={(newVal) => { handleParamChange("label", newVal); }}/>
      </label>
      <label>
        {store.t("rowTitleAddress")}:
        <Input value={rowsData.address} onChange={(newVal) => { handleParamChange("address", newVal); }}/>
      </label>
      <label>
        {store.t("rowTitleSize")}:
        <Select value={rowsData.size} options={sizeOptions} onChange={(newVal) => { handleParamChange("size", newVal); }}/>
        <div className={`sizeVisual ${rowsData.size}`} />
      </label>
      <label>
        {store.t("rowTitleColor")}:
        <Select value={rowsData.color} options={colorOptions} onChange={(newVal) => { handleParamChange("color", newVal); }}/>
        <div className="circle" style={{"backgroundColor": rowsData.color}} />
      </label>
      <b>{store.t("rowTitleUTS")}:</b>
      {(Object.keys(HOST_STATE)).map(key => {
        const state = key as HOST_STATE;
        return <label key={state} className="indent">
          {state}
          <Input value={String(rowsData.updateTimeStrategy[state] / k)} onChange={(newVal) => { handleUTSChange(state, newVal); }} css={{"width": "6em"}}/>
        </label>;
      }
      )}

    </RowEditModalStyle>}
  </Modal>;
};