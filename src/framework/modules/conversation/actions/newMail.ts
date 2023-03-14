import { Dispatch } from 'redux';

import { IGlobalState } from '~/app/store';
import { assertSession } from '~/framework/modules/auth/reducer';
import { newMailService } from '~/framework/modules/conversation/service/newMail';
import { LocalFile } from '~/framework/util/fileHandler';
import { IUploadCallbaks } from '~/framework/util/fileHandler/service';

export function sendMailAction(mailDatas, draftId: string | undefined, InReplyTo: string) {
  return async () => {
    const sentMail = await newMailService.sendMail(mailDatas, draftId, InReplyTo);
    return sentMail;
  };
}

export function forwardMailAction(draftId: string, forwardFrom: string) {
  return async () => {
    try {
      await newMailService.forwardMail(draftId, forwardFrom);
    } catch {
      // TODO: Manage error
    }
  };
}

export function makeDraftMailAction(mailDatas, inReplyTo: string, isForward: boolean) {
  return async (dispatch: Dispatch) => {
    const draftMail = await newMailService.makeDraftMail(mailDatas, inReplyTo);
    return draftMail;
  };
}

export function updateDraftMailAction(mailId: string, mailDatas) {
  return async () => {
    const updatedDraft = await newMailService.updateDraftMail(mailId, mailDatas);
    return updatedDraft;
  };
}

export function addAttachmentAction(mailId: string, attachment: LocalFile, callbacks?: IUploadCallbaks) {
  return async (dispatch: Dispatch, getState: () => IGlobalState) => {
    const session = assertSession();
    const newAttachment = await newMailService.addAttachment(session, mailId, attachment, callbacks);
    return newAttachment;
  };
}

export function deleteAttachmentAction(mailId: string, attachmentId: string) {
  return async (dispatch: Dispatch) => {
    const deletedAttachment = await newMailService.deleteAttachment(mailId, attachmentId);
    return deletedAttachment;
  };
}
