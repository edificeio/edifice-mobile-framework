import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';

import { DiscussionStatus } from '~/framework/modules/communities/utils';

export type DiscussionCardType = DiscussionIcon;

export interface DiscussionCardProps {
  lastMessageDate?: Temporal.Instant;
  membersDisplayed: string[];
  membersTotal: number;
  newContent?: { hasNewContent?: boolean; messagesCount?: number };
  responsesCount: number;
  status?: DiscussionStatus;
  title: string;
  type: DiscussionCardType;
  onPress: () => void;
}
