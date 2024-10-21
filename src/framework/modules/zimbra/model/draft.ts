import { IRecipient } from '.';

import { IDistantFileWithId } from '~/framework/util/fileHandler';

export interface IDraft {
  to: IRecipient[];
  cc: IRecipient[];
  bcc: IRecipient[];
  subject: string;
  body: string;
  threadBody: string;
  attachments: IDistantFileWithId[];
  id?: string;
  inReplyTo?: string;
}
