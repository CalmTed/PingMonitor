import React, { FC } from "react";
import { Modal } from "./Modal";
import { Option, StoreModel } from "src/models";
import { ACTION_NAME } from "src/utils/reducer";
import { ConfigItemType, getConfigList, ConfigListModel, setConfig } from "src/utils/config";
import { Word } from "src/utils/lang";
import { CONFIG_TYPE } from "src/constants";
import Select from "./Select";
import Checkbox from "./Checkbox";
import Input from "./Input";
import styled from "styled-components";

interface ConfigModalModel{
  store: StoreModel
}

export const ConfigModal:FC<ConfigModalModel> = ({store}) => {
  const handleClose = () => {
    store.dispatch({
      name: ACTION_NAME.APP_SET_CONFIG_OPEN_STATE,
      payload: false
    });
  };
  const groupItems:(config: ConfigListModel) => {label: Word, items: ConfigItemType[]}[] = (config) => {
    const ret:{
      label: Word
      items: ConfigItemType[]
    }[] = [];
    //const allGroups = new Set();
    Object.values(config).map((item) => {
      //check if group exists
      if(!ret.find(group => group.label === item.group)) {
        //not - add new grop
        ret.push({
          label: item.group,
          items: []
        });
      }
      //add to group
      const targetGroup = ret.find(group => group.label === item.group);
      if(targetGroup) { //it has to be true because we checked and created it earlier
        ret[ret.indexOf(targetGroup)].items.push(item);
      }
    });
    return ret;
  };
  const config = getConfigList();
  //grop by category
  //render group header and each config item
  const groups = groupItems(config);
  return <Modal isShown={store.state.isConfigOpen} onClose={handleClose}>
    <h1>{store.t("headerSettings")}</h1>
    {groups.map(group => {
      return <div key={group.label}>
        <b>{store.t(group.label)}</b>
        {group.items.map(item => {
          return <ConfigItemComponent key={item.label} store={store} item={item}/>;
        })}
      </div>;
    })}
  </Modal>;
};

interface ConfigItemComponentModel{
  store: StoreModel
  item: ConfigItemType
}

const ConfigItemComponentStyle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8em;
  height: 3em;
`;

const ConfigItemComponent:FC<ConfigItemComponentModel> = ({store, item}) => {
  const handleConfigChange = (newValue: string) => {
    switch(item.type) {
    case CONFIG_TYPE.number:
      const num = parseInt(newValue);
      setConfig(item.name, {
        ...item,
        value: num ? num : item.defaultValue
      });
      break;
    case CONFIG_TYPE.options:
      setConfig(item.name, {
        ...item,
        value: newValue
      });
    }
    store.dispatch({
      name: ACTION_NAME.CONFIG_RERENDER
    });
  };
  const handleCheckboxClick = () => {
    if(item.type === CONFIG_TYPE.boolean) {
      setConfig(item.name, {
        ...item,
        value: !item.value
      });
    }
    store.dispatch({
      name: ACTION_NAME.CONFIG_RERENDER
    });
  };
  const translateOptions: (arg: Option[]) => Option[] = (options) => {
    return options.map(option => {
      return{
        ...option,
        label: store.t(option.label as Word)
      };
    });
  };
  return <ConfigItemComponentStyle>
    <span>{store.t(item.label)}:</span>
    {item.type === CONFIG_TYPE.options && (
      <Select value={item.value || item.defaultValue} options={translateOptions(item.options)} onChange={handleConfigChange}/>
    )}
    {item.type === CONFIG_TYPE.boolean && (
      <Checkbox checked={item.value} onClick={handleCheckboxClick}/>
    )}
    {item.type === CONFIG_TYPE.number && (
      <Input value={String(item.value)} onChange={handleConfigChange} />
    )}
  </ConfigItemComponentStyle>;
};