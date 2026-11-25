/**
 * Type definitions for common comments data structures.
 */

import { Temporal } from '@js-temporal/polyfill';

import type { AccountType } from '~/framework/modules/auth/model';

interface CommonItemData {
  id: string;
  authorId: string;
  authorName: string;
  authorAccountType: AccountType;
  date: Temporal.Instant;
}
interface CommonDeletedItemData extends CommonItemData {
  deleted: true;
}
interface CommonContentItemData extends CommonItemData {
  content: string;
  isRichContent?: boolean;
}
interface CommentItemData {
  replies: (ReplyEllipsisItem | ReplyItem | ReplyDeletedItem)[];
}
interface ReplyItemData {}

export interface ReplyItem extends CommonContentItemData, ReplyItemData {}
export interface ReplyDeletedItem extends CommonDeletedItemData, ReplyItemData {}
export interface ReplyEllipsisItem {
  start: number;
  count: number;
}
export interface CommentItem extends CommonContentItemData, CommentItemData {}
export interface CommentDeletedItem extends CommonDeletedItemData, CommentItemData {}

export type AnyItem = AnyActualItem | ReplyEllipsisItem;
export type AnyCommentItem = CommentItem | CommentDeletedItem;
export type AnyReplyItem = ReplyItem | ReplyDeletedItem;
export type AnyActualItem = AnyCommentItem | AnyReplyItem;
