import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';

import { AccountType } from '~/framework/modules/auth/model';

export interface DiscussionHeaderProps {
  authorName: string;
  authorProfile: AccountType;
  createdAt?: Temporal.Instant;
  title: string;
  type: DiscussionIcon;
}
