import { Temporal } from '@js-temporal/polyfill';

export type DiscussionCardType = 'discussion' | 'event' | 'important' | 'other' | 'question';

export interface DiscussionCardProps {
  title: string;
  type: DiscussionCardType;
  responsesCount: number;
  membersDisplayed: string[];
  membersTotal: number;
  newContent?: { hasNewContent?: boolean; messagesCount?: number };
  lastMessageDate?: Temporal.Instant;
  isLocked?: boolean;
  isHidden?: boolean;
  onPress: () => void;
}
