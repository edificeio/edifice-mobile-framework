import { Dispatch } from 'redux';

import { IGlobalState } from '~/AppStore';
import { newMailService } from '~/framework/modules/conversation/service/newMail';
import { LocalFile } from '~/framework/util/fileHandler';
import { IUploadCallbaks } from '~/framework/util/fileHandler/service';
import { getUserSession } from '~/framework/util/session';

export function sendMailAction(mailDatas, draftId: string | undefined, InReplyTo: string) {
  return async () => {
    return await newMailService.sendMail(mailDatas, draftId, InReplyTo);
  };
}

export function forwardMailAction(draftId: string, forwardFrom: string) {
  return async () => {
    try {
      await newMailService.forwardMail(draftId, forwardFrom);
    } catch (errmsg) {
      // TODO: Manage error
    }
  };
}

export function makeDraftMailAction(mailDatas, inReplyTo: string, isForward: boolean) {
  return async (dispatch: Dispatch) => {
    return await newMailService.makeDraftMail(mailDatas, inReplyTo);
  };
}

export function updateDraftMailAction(mailId: string, mailDatas) {
  return async () => {
    return await newMailService.updateDraftMail(mailId, mailDatas);
  };
}

export function addAttachmentAction(mailId: string, attachment: LocalFile, callbacks?: IUploadCallbaks) {
  return async (dispatch: Dispatch, getState: () => IGlobalState) => {
    try {
      const session = getUserSession();
      const newAttachment = await newMailService.addAttachment(session, mailId, attachment, callbacks);
      return newAttachment;
    } catch (errmsg) {
      throw errmsg;
    }
  };
}

export function deleteAttachmentAction(mailId: string, attachmentId: string) {
  return async (dispatch: Dispatch) => await newMailService.deleteAttachment(mailId, attachmentId);
}
