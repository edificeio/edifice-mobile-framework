import { newMailService } from "../service/newMail";

export function deleteMessageAction(mailId: string) {
  return async () => {
    try {
      await newMailService.deleteMessage(mailId);
    } catch (errmsg) {
      console.error("ERROR delete mail: ", errmsg);
    }
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
