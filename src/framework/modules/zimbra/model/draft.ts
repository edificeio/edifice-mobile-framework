import { IDistantFileWithId } from '~/framework/util/fileHandler';

import { IRecipient } from '.';

export interface IDraft {
  to: IRecipient[];
  cc: IRecipient[];
  bcc: IRecipient[];
  subject: string;
  body: string;
  threadBody: string;
  attachments: IDistantFileWithId[];
  inReplyTo?: string;
}
