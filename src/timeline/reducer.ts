import { AsyncStorage } from "react-native";
import * as reducerActions from "./reducerActions";
import { createEndSessionActionType } from "../infra/redux/reducerFactory";
import { AnyAction } from "redux";

interface IParams {
  blogTitle: string;
  username: string;
}

export interface INewsModel {
  date: number;
  eventType: string;
  id: string;
  images: object[];
  message: string;
  preview: string;
  resourceName: string;
  senderId: string;
  senderName: string;
  type: string;
}

export interface INewsState {
  endReached: boolean;
  isFetching: boolean;
  news: INewsModel[];
  availableApps: any;
  selectedApps: any;
  refresh: boolean;
  fetchFailed: boolean;
}

const initialState: INewsState = {
  endReached: false,
  isFetching: false,
  news: [],
  availableApps: undefined,
  selectedApps: undefined,
  refresh: true,
  fetchFailed: false
};

export default (
  state = initialState,
  action: AnyAction
) => {
  for (let actionType in reducerActions) {
    if (action.type === actionType) {
      return reducerActions[actionType](state, action);
    }
  }

  // Session flush forward-compatibility.
  if (action.type == createEndSessionActionType()) {
    return initialState;
  }

  return {
    ...state
  };
};
