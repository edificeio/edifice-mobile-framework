import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';

export type DiscussionCardType = DiscussionIcon;

export interface DiscussionCardProps {
  isHidden?: boolean;
  isLocked?: boolean;
  lastMessageDate?: Temporal.Instant;
  membersDisplayed: string[];
  membersTotal: number;
  newContent?: { hasNewContent?: boolean; messagesCount?: number };
  responsesCount: number;
  title: string;
  type: DiscussionCardType;
  onPress: () => void;
}
