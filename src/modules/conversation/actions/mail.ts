import { Dispatch } from 'redux';

import { mailService } from '~/modules/conversation/service/mail';

export function toggleReadAction(mailIds: string[], read: boolean) {
  return async (dispatch: Dispatch) => {
    await mailService.toggleRead(mailIds, read);
  };
}

export function trashMailsAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    await mailService.trashMails(mailIds);
  };
}

export function restoreMailsAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    await mailService.restoreMails(mailIds);
  };
}

export function restoreMailsToInboxAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    await mailService.restoreMails(mailIds);
    await mailService.moveMailsToInbox(mailIds);
  };
}

export function restoreMailsToFolderAction(mailIds: string[], folderId: string) {
  return async (dispatch: Dispatch) => {
    await mailService.restoreMails(mailIds);
    await mailService.moveMailsToFolder(mailIds, folderId);
  };
}

export function deleteMailsAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    await mailService.deleteMails(mailIds);
  };
}

export function deleteDraftsAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    await mailService.trashMails(mailIds);
    await mailService.deleteMails(mailIds);
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
