import { Dispatch } from "redux";

import { mailService } from "../service/mail";

export function toggleReadAction(mailIds: string[], read: boolean) {
  return async (dispatch: Dispatch) => {
    await mailService.toggleRead(mailIds, read);
  };
}

export function trashMailsAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    try {
      await mailService.trashMails(mailIds);
    } catch (errmsg) {
      console.error(errmsg)
    }
  };
}

export function restoreMailsAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    await mailService.restoreMails(mailIds);
  };
}

export function deleteMailsAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    try {
      await mailService.deleteMails(mailIds);
    } catch (errmsg) {
      console.error(errmsg)
    }
  };
}

export function moveMailsToFolderAction(mailIds: string[], folderId: string) {
  return async (dispatch: Dispatch) => {
    await mailService.moveMailsToFolder(mailIds, folderId);
  };
}

export function moveMailsToInboxAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    await mailService.moveMailsToInbox(mailIds);
  };
}
