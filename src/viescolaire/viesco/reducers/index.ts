import { combineReducers } from "redux";

const dummy = (state: any = {}, action: any) => {
  switch (action.type) {
    default:
      return state;
  }
};

const rootReducer = combineReducers({ dummy });

export default rootReducer;
