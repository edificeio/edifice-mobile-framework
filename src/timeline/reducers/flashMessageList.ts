/**
 * Flash message list state reducer
 */

import { IFlashMessageList, initialState } from "../state/flashMessageList";
import { flashMessageListActionTypes, flashMessageMarkAsReadActionTypes } from "../state/flashMessageList";
import asyncReducer from "../../infra/redux/async";
import { allFlashMessageActions } from "../actions/flashList";

// THE REDUCER ------------------------------------------------------------------------------------

export const flashMessageListReducer = (
    state: IFlashMessageList = initialState,
    action: AnyAction
) => {
    switch (action.type) {
        case flashMessageListActionTypes.receipt:
            return action.data;
        case flashMessageMarkAsReadActionTypes.receipt:
            return [...state.filter(flashMessage => flashMessage.id != action.data)]
        default:
            return state;
    }
};

//FIXME: use "async2" reducer
export default asyncReducer<IFlashMessageList>(
    flashMessageListReducer,
    allFlashMessageActions
);
