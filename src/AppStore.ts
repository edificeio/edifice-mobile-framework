import { applyMiddleware, createStore, compose, Reducer, Store } from "redux";
import thunkMiddleware from "redux-thunk";

import { IUserInfoState } from "./user/reducers/info";
import { IUserAuthState } from "./user/reducers/auth";

const enhancer = applyMiddleware(thunkMiddleware);

export const global: { store?: Store } = {};

export const getSessionInfo = () => ({
  ...(global.store!.getState() as any).user.info
}) as IUserInfoState & IUserAuthState;

export function generateStore(rootReducer: Reducer<any>) {
  return window.__REDUX_DEVTOOLS_EXTENSION__ ?
    createStore(
      rootReducer,
      compose(
        enhancer,
        window.__REDUX_DEVTOOLS_EXTENSION__()
      )
    ) :
    createStore(
      rootReducer,
      enhancer
    );
}
