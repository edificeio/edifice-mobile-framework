import { Temporal } from '@js-temporal/polyfill';

export type ConversationCardType = 'discussion' | 'event' | 'important' | 'other' | 'question';

export interface ConversationCardProps {
  title: string;
  type: ConversationCardType;
  responsesCount: number;
  membersDisplayed: string[];
  membersTotal: number;
  newContent?: { hasNewContent?: boolean; messagesCount?: number };
  lastMessageDate?: Temporal.Instant;
  isLocked?: boolean;
  isHidden?: boolean;
  onPress: () => void;
}
