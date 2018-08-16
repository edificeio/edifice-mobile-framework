import * as reducerActions from "./reducerActions";

export interface IUser {
  userId: string;
  displayName: string;
}
export interface IGroup {
  id: string;
  name: string;
}

export interface IAuthState {
  email: string;
  password: string;
  loggedIn: boolean;
  synced: boolean;
  userId: string;
  error: string;
  notificationsPrefs: any;
}

export const initialState: IAuthState = {
  email: undefined,
  error: undefined,
  loggedIn: false,
  notificationsPrefs: [],
  password: undefined,
  synced: true,
  userId: undefined
};

export default (state: IAuthState = initialState, action): IAuthState => {
  for (const actionType in reducerActions) {
    if (action.type === actionType) {
      return reducerActions[actionType](state, action);
    }
  }

  return {
    ...state
  };
};
