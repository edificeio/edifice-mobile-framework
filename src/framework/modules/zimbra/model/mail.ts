import { Moment } from 'moment';

export type IMailAttachment = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
};

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
  attachments: IMailAttachment[];
  body: string;
  from: string;
}
