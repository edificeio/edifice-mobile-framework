import { newMailService } from "../service/newMail";

export function sendMailAction(mailDatas) {
  return async () => {
    try {
      await newMailService.sendMail(mailDatas);
    } catch (errmsg) {
      console.error("ERROR new mail: ", errmsg);
    }
  };
}

export function makeDraftMailAction(mailDatas) {
  return async () => {
    try {
      await newMailService.makeDraftMail(mailDatas);
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
