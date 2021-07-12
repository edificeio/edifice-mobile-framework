/**
 * Zimbra Reducer
 */

/* eslint-disable flowtype/no-types-missing-file-annotation */
import { ICountListState } from "./state/count";
import { IFolderListState } from "./state/folders";
import { IInitMailState } from "./state/initMails";
import { IMailContentState } from "./state/mailContent";
import { IMailListState } from "./state/mailList";
import { IQuotaState } from "./state/quota";
import { ISignatureState } from "./state/signature";

// State

export interface IZimbra_State {
  count: ICountListState;
  folders: IFolderListState;
  init: IInitMailState;
  mailContent: IMailContentState;
  mailList: IMailListState;
  quota: IQuotaState;
  signature: ISignatureState;
}
