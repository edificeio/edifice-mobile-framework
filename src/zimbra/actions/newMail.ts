import { Dispatch } from "redux";

import { progressAction, progressEndAction, progressInitAction } from "../../infra/actions/progress";
import { Trackers } from "../../infra/tracker";
import { newMailService } from "../service/newMail";

export function sendMailAction(mailDatas, draftId: string, InReplyTo: string) {
  return async () => {
    Trackers.trackEvent("Zimbra", "SEND MAIL");
    try {
      await newMailService.sendMail(mailDatas, draftId, InReplyTo);
    } catch (errmsg) {
      console.error("ERROR new mail: ", errmsg);
    }
  };
}

export function forwardMailAction(draftId: string, forwardFrom: string) {
  return async () => {
    Trackers.trackEvent("Zimbra", "FORWARD MAIL");
    try {
      await newMailService.forwardMail(draftId, forwardFrom);
    } catch (errmsg) {
      console.error("ERROR forward mail: ", errmsg);
    }
  };
}

export function makeDraftMailAction(mailDatas, inReplyTo: string, isForward: boolean) {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Zimbra", "MAKE DRAFT");
    return await newMailService.makeDraftMail(mailDatas, inReplyTo, isForward);
  };
}

export function updateDraftMailAction(mailId: string, mailDatas) {
  return async () => {
    Trackers.trackEvent("Zimbra", "UPDATE DRAFT");
    return await newMailService.updateDraftMail(mailId, mailDatas);
  };
}

export function addAttachmentAction(mailId: string, attachment: any) {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Zimbra", "ADD ATTACHMENT");
    try {
      dispatch(progressInitAction());
      const handleProgress = progress => dispatch(progressAction(progress));
      const newAttachments = await newMailService.addAttachment(mailId, attachment, handleProgress);
      dispatch(progressEndAction());
      return newAttachments;
    } catch (errmsg) {
      console.log("ERROR uploading attachment", errmsg);
      dispatch(progressEndAction());
      throw errmsg;
    }
  };
}

export function deleteAttachmentAction(mailId: string, attachmentId: string) {
  Trackers.trackEvent("Zimbra", "DELETE ATTACHMENT");
  return async (dispatch: Dispatch) => await newMailService.deleteAttachment(mailId, attachmentId);
}
