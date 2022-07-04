/**
 * Workspace selection state reducer
 * Holds a list of selected item in a simple Array
 */
import { SET_CONTENT_URI_TYPE } from '~/modules/workspace/actions/contentUri';

const initialState = null;

export default (state = initialState, action: any) => {
  switch (action.type) {
    case SET_CONTENT_URI_TYPE:
      return action.payload;
    default:
      return state;
  }
};
