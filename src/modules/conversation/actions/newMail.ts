import { Dispatch } from "redux";

import { Trackers } from "../../../infra/tracker";
import { newMailService } from "../service/newMail";
import { getUserSession } from "../../../framework/util/session";
import { IGlobalState } from "../../../AppStore";
import { LocalFile } from "../../../framework/util/fileHandler";
import { IUploadCallbaks } from "../../../framework/util/fileHandler/service";


export function sendMailAction(mailDatas, draftId: string | undefined, InReplyTo: string) {
  return async () => {
    Trackers.trackEvent("Conversation", "SEND");
    try {
      await newMailService.sendMail(mailDatas, draftId, InReplyTo);
    } catch (errmsg) {
      console.error("ERROR new mail: ", errmsg);
    }
  };
}

export function forwardMailAction(draftId: string, forwardFrom: string) {
  return async () => {
    try {
      await newMailService.forwardMail(draftId, forwardFrom);
    } catch (errmsg) {
      console.error("ERROR forward mail: ", errmsg);
    }
  };
}

export function makeDraftMailAction(mailDatas, inReplyTo: string, isForward: boolean) {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Conversation", "CREATED");
    if (inReplyTo) Trackers.trackEvent("Conversation", "REPLY TO MESSAGE");
    if (isForward) Trackers.trackEvent("Conversation", "TRANSFER MESSAGE");
    return await newMailService.makeDraftMail(mailDatas, inReplyTo);
  };
}

export function updateDraftMailAction(mailId: string, mailDatas) {
  return async () => {
    return await newMailService.updateDraftMail(mailId, mailDatas);
  };
}

export function addAttachmentAction(mailId: string, attachment: LocalFile, callbacks?: IUploadCallbaks ) {
  return async (dispatch: Dispatch, getState: () => IGlobalState) => {
    try {
      const session = getUserSession(getState());
      const newAttachment = await newMailService.addAttachment(session, mailId, attachment, callbacks);
      // console.log("service returned", newAttachment);
      return newAttachment;
    } catch (errmsg) {
      console.warn("ERROR uploading attachment", errmsg);
      throw errmsg;
    }
  };
}

export function deleteAttachmentAction(mailId: string, attachmentId: string) {
  return async (dispatch: Dispatch) => await newMailService.deleteAttachment(mailId, attachmentId);
}
