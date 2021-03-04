import { Dispatch } from "redux";

import { progressAction, progressEndAction, progressInitAction } from "../../infra/actions/progress";
import { Trackers } from "../../infra/tracker";
import { supportService } from "../service/support";

export function createTicketAction() {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Support", "SEND");
    await supportService.createTicket();
  };
}

export function addAttachmentAction(file: any) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(progressInitAction());
      const handleProgress = progress => dispatch(progressAction(progress));
      const newAttachments = await supportService.addAttachment(file, handleProgress);
      dispatch(progressEndAction());
      return newAttachments;
    } catch (errmsg) {
      console.error("ERROR uploading attachment", errmsg);
      dispatch(progressEndAction());
      throw errmsg;
    }
  };
}

export function deleteAttachmentAction(attachmentId: string) {
  return async (dispatch: Dispatch) => await supportService.deleteAttachment(attachmentId);
}
