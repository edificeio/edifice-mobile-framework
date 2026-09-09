import { FlatList, FlatListProps, ListRenderItemInfo, StyleProp, ViewStyle } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatTextAreaProps } from '~/framework/components/inputs/text2';
import { AccountType } from '~/framework/modules/auth/model';

export namespace CommentsThread {
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

  export interface Config {
    repliesStartSize: number;
    repliesPageSize: number;
    showDeletedItems: 'always' | 'children' | 'never';
    allowReplies: boolean;
  }

  export interface Props
    extends
      Pick<NativeStackScreenProps<ParamListBase>, 'navigation'>,
      React.PropsWithChildren,
      Partial<Config>,
      Pick<FlatListProps<CommentsThreadInternals.Item>, 'refreshControl'> {
    canAddComment: boolean;
    alwaysShowCommentField?: boolean;
    style?: StyleProp<ViewStyle>;
    data: (CommentItem | CommentDeletedItem)[];
    focusItem?: CommonItemData['id'];
    onSubmit?: (
      data: Pick<CommonContentItemData, 'content' | 'isRichContent'>,
      replyTo?: CommonItemData['id'],
    ) => Promise<CommonItemData['id']>;
    onEdit?: (data: Pick<CommonContentItemData, 'content' | 'isRichContent'>, id: CommonItemData['id']) => Promise<void>;
    onDelete?: (id: CommonItemData['id']) => Promise<void>;
  }
}

export namespace CommentsThreadInternals {
  export const ITEM_COMMENT = Symbol('ITEM_COMMENT');
  export const ITEM_COMMENT_DELETED = Symbol('ITEM_COMMENT_DELETED');
  export const ITEM_REPLY = Symbol('ITEM_REPLY');
  export const ITEM_REPLY_DELETED = Symbol('ITEM_REPLY_DELETED');
  export const ITEM_REPLY_ELLIPSIS = Symbol('ITEM_REPLY_ELLIPSIS');

  export interface CommentItem extends Omit<CommentsThread.CommentItem, 'replies'> {
    type: typeof ITEM_COMMENT;
    nbReplies: number;
  }
  export interface CommentDeletedItem extends Omit<CommentsThread.CommentDeletedItem, 'replies'> {
    type: typeof ITEM_COMMENT_DELETED;
    nbReplies: number;
  }
  export interface ReplyItem extends CommentsThread.ReplyItem {
    type: typeof ITEM_REPLY;
    inReplyTo: CommentItem['id'];
    inReplyToIndex: number;
    hasReplies: boolean;
  }
  export interface ReplyDeletedItem extends CommentsThread.ReplyDeletedItem {
    type: typeof ITEM_REPLY_DELETED;
    inReplyTo: CommentItem['id'];
    inReplyToIndex: number;
    hasReplies: boolean;
  }
  export interface ReplyEllipsisItem extends CommentsThread.ReplyEllipsisItem {
    type: typeof ITEM_REPLY_ELLIPSIS;
    inReplyTo: CommentItem['id'];
    inReplyToIndex: number;
    hasReplies: boolean;
  }

  export type Item = CommentItem | ReplyItem | CommentDeletedItem | ReplyDeletedItem | ReplyEllipsisItem;

  export interface ContextState {
    newCommentHeight: number;
    newCommentValue: string;
    editId?: CommentsThreadInternals.ReplyItem['id'];
    editValue?: string;
    editHasChanges?: boolean;
  }
  export type ContextAction =
    | Pick<ContextState, 'newCommentHeight'>
    | Pick<ContextState, 'newCommentValue'>
    | Required<Pick<ContextState, 'editId' | 'editValue' | 'editHasChanges'>>
    | { editId: undefined; editValue: undefined; editHasChanges: undefined };

  export type ContextReducer = (state: ContextState, newValues: ContextAction) => ContextState;
  export type Context = [ContextState, React.ActionDispatch<[ContextAction]>];

  export interface ItemProps
    extends ListRenderItemInfo<CommentsThreadInternals.Item>, Partial<Pick<CommentsThread.Config, 'allowReplies'>> {
    onUnfoldReplies?: (id: string, start: number, count: number) => void;
    canAddComment?: boolean;
    onPressReply?: (item: CommentsThreadInternals.CommentItem, index: number) => void;
    onSendEdit?: CommentsThread.Props['onEdit'];
    inputRef?: ChatTextAreaProps['ref'];
    listRef?: React.RefObject<FlatList<CommentsThreadInternals.Item> | null>;
    onPressEdit?: (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => void;
    onPressDelete?: (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => void;
  }
}
