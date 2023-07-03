import { Moment } from 'moment';

import { IDistantFileWithId } from '~/framework/util/fileHandler';

export interface IMail {
  id: string;
  date: Moment;
  subject: string;
  parentId: string;
  threadId: string;
  state: string;
  unread: boolean;
  response: boolean;
  hasAttachment: boolean;
  systemFolder: string;
  to: string[];
  cc: string[];
  bcc: string[];
  displayNames: string[][];
  attachments: IDistantFileWithId[];
  body: string;
  from: string;
  key: string;
}
