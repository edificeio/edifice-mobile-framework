import { createSessionAsyncReducer } from "../../infra/redux/async2";
import {
  initialState,
  actionTypes,
  postAttachmentActionType,
  deleteAttachmentActionType,
  updateDraftIdActionType,
} from "../state/mailContent";

export default createSessionAsyncReducer(initialState, actionTypes, {
  [postAttachmentActionType]: (state = initialState, action) => {
    return {
      ...state,
      attachments: action.data,
    };
  },
  [deleteAttachmentActionType]: (state = initialState, action) => {
    const newState = { ...state };
    newState.attachments.splice(
      newState.attachments.find(a => a.id === action.data),
      1
    );
    return newState;
  },
  [updateDraftIdActionType]: (state = initialState, action) => {
    return { ...state, id: action.data };
  },
});
