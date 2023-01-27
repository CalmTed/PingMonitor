import { getInitialState } from "src/initials";
import { StateModel } from "src/models";
import { ActionType, reducer } from "./reducer";
const subscribers: ((state: StateModel)=>void)[] = [];
const getState = () => {
  const localJSON = localStorage.getItem("state");
  const initState = getInitialState();
  if(localJSON) {
    try{
      return JSON.parse(localJSON);
    }catch(e) {
      return initState;
    }
  }
  return initState;
};
const setState = (state:StateModel) => {
  localStorage.setItem("state", JSON.stringify(state));
};
const subscribe = (onChange: (state: StateModel) => void) => {
  subscribers.push(onChange);
  return;
};
const dispach = (action: ActionType) => {
  const newState: StateModel | null = reducer(getState(), action);
  if(newState) {
    setState(newState);
    subscribers.map(onchange => onchange(newState));
  }
  return;
};

const stateManager = {
  getState,
  subscribe,
  dispach
};

export default stateManager;