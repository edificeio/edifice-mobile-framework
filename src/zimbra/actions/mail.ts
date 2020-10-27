import { Dispatch } from "redux";

import { Trackers } from "../../infra/tracker";
import { mailService } from "../service/mail";

export function toggleReadAction(mailIds: string[], read: boolean) {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Zimbra", "TOGGLE READ");
    await mailService.toggleRead(mailIds, read);
  };
}

export function trashMailsAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Zimbra", "TRASH");
    await mailService.trashMails(mailIds);
  };
}

export function deleteMailsAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Zimbra", "DELETE");
    await mailService.deleteMails(mailIds);
  };
}

export function moveMailsToFolderAction(mailIds: string[], folderId: string) {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Zimbra", "MOVE TO FOLDER");
    await mailService.moveMailsToFolder(mailIds, folderId);
  };
}

export function moveMailsToInboxAction(mailIds: string[]) {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Zimbra", "MOVE TO INBOX");
    await mailService.moveMailsToInbox(mailIds);
  };
}
