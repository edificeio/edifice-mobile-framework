/**
 * Workspace selection state reducer
 * Holds a list of selected item in a simple Array
 */
import { SET_CONTENT_URI_TYPE } from "../actions/contentUri";

const initialState = [
  {
    uri: "",
  },
];

export default (state = "", action: any) => {
  switch (action.type) {
    case SET_CONTENT_URI_TYPE:
      return action.payload;
    default:
      return state;
  }
};
