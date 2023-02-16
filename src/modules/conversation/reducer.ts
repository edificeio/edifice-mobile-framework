/**
 * Conversation Reducer
 */
import { ICountListState } from './state/count';
import { IFolderListState } from './state/folders';
import { IInitMailState } from './state/initMails';
import { IMailContentState } from './state/mailContent';
import { IMailListState } from './state/mailList';
import { ISignatureState } from './state/signature';

// State

export interface IConversationState {
  count: ICountListState;
  folders: IFolderListState;
  init: IInitMailState;
  mailContent: IMailContentState;
  mailList: IMailListState;
  signature: ISignatureState;
}
