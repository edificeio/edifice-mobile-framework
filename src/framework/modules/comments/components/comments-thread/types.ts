import { FlatList, FlatListProps, ListRenderItemInfo, StyleProp, ViewStyle } from 'react-native';

import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatTextAreaProps } from '~/framework/components/inputs/text2';
import * as CommentsThread from '~/framework/modules/comments/types';

export interface CommentsThreadConfig {
  repliesStartSize: number;
  repliesPageSize: number;
  showDeletedItems: 'always' | 'children' | 'never';
  allowReplies: boolean;
}

export interface CommentsThreadProps
  extends
    Pick<NativeStackScreenProps<ParamListBase>, 'navigation'>,
    React.PropsWithChildren,
    Partial<CommentsThreadConfig>,
    Pick<FlatListProps<CommentsThreadInternals.Item>, 'refreshControl'> {
  canAddComment: boolean;
  alwaysShowCommentField?: boolean;
  style?: StyleProp<ViewStyle>;
  data: (CommentsThread.CommentItem | CommentsThread.CommentDeletedItem)[];
  focusItem?: CommentsThread.AnyActualItem['id'];
  onSubmit?: (
    data: Pick<CommentsThread.CommentItem | CommentsThread.ReplyItem, 'content' | 'isRichContent'>,
    replyTo?: CommentsThread.CommentItem['id'],
  ) => Promise<CommentsThread.ReplyItem['id']>;
  onEdit?: (
    data: Pick<CommentsThread.CommentItem | CommentsThread.ReplyItem, 'content' | 'isRichContent'>,
    id: (CommentsThread.CommentItem | CommentsThread.ReplyItem)['id'],
  ) => Promise<void>;
  onDelete?: (id: (CommentsThread.CommentItem | CommentsThread.ReplyItem)['id']) => Promise<void>;
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
    extends ListRenderItemInfo<CommentsThreadInternals.Item>, Partial<Pick<CommentsThreadConfig, 'allowReplies'>> {
    onUnfoldReplies?: (id: string, start: number, count: number) => void;
    canAddComment?: boolean;
    onPressReply?: (item: CommentsThreadInternals.CommentItem, index: number) => void;
    onSendEdit?: CommentsThreadProps['onEdit'];
    inputRef?: ChatTextAreaProps['ref'];
    listRef?: React.RefObject<FlatList<CommentsThreadInternals.Item> | null>;
    onPressEdit?: (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => void;
    onPressDelete?: (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => void;
  }
}
