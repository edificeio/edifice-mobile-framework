import { Dispatch } from "redux";

import { progressAction, progressEndAction, progressInitAction } from "../../infra/actions/progress";
import { ITicket } from "../containers/Support";
import { supportService } from "../service/support";

export function createTicketAction(ticket: ITicket) {
  return async (dispatch: Dispatch) => {
    return await supportService.createTicket(ticket);
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
