import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../infra/redux/async2";
import { mailContentService } from "../service/mailContent";
import {
  actionTypes,
  IMail,
  postAttachmentActionType,
  deleteAttachmentActionType,
  updateDraftIdActionType,
} from "../state/mailContent";

// ACTION LIST ------------------------------------------------------------------------------------

const actions = createAsyncActionCreators<IMail>(actionTypes);

export const dataActions = {
  ...actions,
  postAttachments: data => ({
    type: postAttachmentActionType,
    data,
  }),
  deleteAttachment: data => ({
    type: deleteAttachmentActionType,
    data,
  }),
  updateId: data => ({
    type: updateDraftIdActionType,
    data,
  }),
};

// THUNKS -----------------------------------------------------------------------------------------

export function fetchMailContentAction(mailId) {
  return async (dispatch: Dispatch, getState: () => any) => {
    try {
      dispatch(dataActions.request());
      const data = await mailContentService.get(mailId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
