/**
 * Flash message list state reducer
 */

import asyncReducer from '~/infra/redux/async';
import { allFlashMessageActions } from '~/timeline/actions/flashList';
import {
  IFlashMessageList,
  initialState,
  flashMessageListActionTypes,
  flashMessageMarkAsReadActionTypes,
} from '~/timeline/state/flashMessageList';

// THE REDUCER ------------------------------------------------------------------------------------

export const flashMessageListReducer = (state: IFlashMessageList = initialState, action: AnyAction) => {
  switch (action.type) {
    case flashMessageListActionTypes.receipt:
      return action.data;
    case flashMessageMarkAsReadActionTypes.receipt:
      return [...state.filter(flashMessage => flashMessage.id != action.data)];
    default:
      return state;
  }
};

//FIXME: use "async2" reducer
export default asyncReducer<IFlashMessageList>(flashMessageListReducer, allFlashMessageActions);
