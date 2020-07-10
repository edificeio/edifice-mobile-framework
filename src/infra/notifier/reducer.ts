import { initialState, notifierActionTypes } from "./state";
import createReducer from "../redux/reducerFactory";

export default createReducer(initialState, {
  [notifierActionTypes.show]: (state, action) => {
    const { id, type, ...actionInfos } = action;
    return {
      ...state,
      [id]: {...actionInfos, visible: true}
    }
  },
  [notifierActionTypes.hide]: (state, action) => {
    const { id } = action;
    return {
      ...state,
      [id]: {...state[id], visible: false}
    }
  }
})
