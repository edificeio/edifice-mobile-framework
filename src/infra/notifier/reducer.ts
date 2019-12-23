import { initialState, notifierActionTypes } from "./state";
import createReducer from "../redux/reducerFactory";

export default createReducer(initialState, {
  [notifierActionTypes.show]: (state, action) => ({
    ...state,
    ...action,
    visible: true
  }),
  [notifierActionTypes.hide]: (state, action) => ({
    ...state,
    visible: false
  })
})
