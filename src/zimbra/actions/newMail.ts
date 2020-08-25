import { Dispatch } from "redux";

import { newMailService } from "../service/newMail";
import { dataActions } from "./mailContent";

export function sendMailAction(mailDatas, draftId: string, InReplyTo: string) {
  return async () => {
    try {
      await newMailService.sendMail(mailDatas, draftId, InReplyTo);
    } catch (errmsg) {
      console.error("ERROR new mail: ", errmsg);
    }
  };
}

export function makeDraftMailAction(mailDatas, inReplyTo: string, methodReply: string) {
  return async (dispatch: Dispatch) => {
    try {
      const id = await newMailService.makeDraftMail(mailDatas, inReplyTo, methodReply);
      dispatch(dataActions.updateId(id));
    } catch (errmsg) {
      console.error("ERROR make draft: ", errmsg);
    }
  };
}

export function updateDraftMailAction(mailId: string, mailDatas) {
  return async () => {
    try {
      await newMailService.updateDraftMail(mailId, mailDatas);
    } catch (errmsg) {
      console.error("ERROR update draft: ", errmsg);
    }
  };
}

export function addAttachmentAction(mailId: string, attachments: any[]) {
  return async (dispatch: Dispatch) => {
    try {
      const newAttachments = await newMailService.addAttachmentToDraft(mailId, attachments);
      dispatch(dataActions.postAttachments(newAttachments));
    } catch (errmsg) {
      console.error("ERROR uploading attachment", errmsg);
    }
  };
}

export function deleteAttachmentAction(mailId: string, attachmentId: string) {
  return async (dispatch: Dispatch) => {
    try {
      await newMailService.deleteAttachment(mailId, attachmentId);
      dispatch(dataActions.deleteAttachment(attachmentId));
    } catch (errmsg) {
      console.error("ERROR deleting attachment", errmsg);
    }
  };
}
