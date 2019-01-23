import { AsyncStorage } from "react-native";
import * as reducerActions from "./reducerActions";

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

export default (
  state: INewsState = {
    endReached: false,
    isFetching: false,
    news: [],
    availableApps: undefined,
    selectedApps: undefined,
    refresh: true,
    fetchFailed: false
  },
  action
) => {
  for (let actionType in reducerActions) {
    if (action.type === actionType) {
      return reducerActions[actionType](state, action);
    }
  }

  return {
    ...state
  };
};
