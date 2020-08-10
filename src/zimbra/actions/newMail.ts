import { newMailService } from "../service/newMail";

export function getSearchUsers(search: string) {
  return async () => {
    await newMailService.getSearchUsers(search);
  };
}

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
