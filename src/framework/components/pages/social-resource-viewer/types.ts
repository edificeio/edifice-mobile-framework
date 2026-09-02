import { FlatList, FlatListProps, ListRenderItemInfo, StyleProp, ViewStyle } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { FlashListProps, FlashListRef } from '@shopify/flash-list';

import { AccountType } from '~/framework/modules/auth/model';

import { ChatTextAreaProps } from '../../inputs/text2';

export namespace SocialResourceViewer {
  interface BaseItemData {
    id: string;
    authorId: string;
    authorName: string;
    authorAccountType: AccountType;
    date: Temporal.Instant;
  }
  interface CommonDeletedItemData extends BaseItemData {
    deleted: true;
  }
  interface CommonContentItemData extends BaseItemData {
    content: string;
    isRichContent?: boolean;
  }
  interface CommentCommentItemData {
    responses: (ResponseItemEllipsis | ResponseItem | ResponseItemDeleted)[];
  }
  interface CommentResponseItemData {}

  export interface ResponseItem extends CommonContentItemData, CommentResponseItemData {}
  export interface ResponseItemDeleted extends CommonDeletedItemData, CommentResponseItemData {}
  export interface ResponseItemEllipsis {
    start: number;
    count: number;
  }
  export interface CommentItem extends CommonContentItemData, CommentCommentItemData {}
  export interface CommentItemDeleted extends CommonDeletedItemData, CommentCommentItemData {}

  export interface CommentsConfig {
    responsesStartSize: number;
    responsesPageSize: number;
    showDeletedItems: 'always' | 'children' | 'never';
    allowResponses: boolean;
  }

  export interface Props
    extends
      Pick<NativeStackScreenProps<ParamListBase>, 'navigation'>,
      React.PropsWithChildren,
      Partial<CommentsConfig>,
      Pick<FlatListProps<SocialResourceViewerInternals.Item>, 'refreshControl'> {
    canAddComment: boolean;
    alwaysShowCommentField?: boolean;
    style?: StyleProp<ViewStyle>;
    data: (CommentItem | CommentItemDeleted)[];
    focusItem?: BaseItemData['id'];
    onSubmit?: (
      data: Pick<CommonContentItemData, 'content' | 'isRichContent'>,
      replyTo?: BaseItemData['id'],
    ) => Promise<BaseItemData['id']>;
    onEdit?: (data: Pick<CommonContentItemData, 'content' | 'isRichContent'>, id: BaseItemData['id']) => Promise<void>;
    onDelete?: (id: BaseItemData['id']) => Promise<void>;
  }
}

export namespace SocialResourceViewerInternals {
  export const ITEM_ADD_RESPONSE = Symbol('ITEM_ADD_RESPONSE');
  export const ITEM_RESPONSE_ELLIPSIS = Symbol('ITEM_RESPONSE_ELLIPSIS');
  export const ITEM_COMMENT = Symbol('ITEM_COMMENT');
  export const ITEM_RESPONSE = Symbol('ITEM_RESPONSE');
  export const ITEM_COMMENT_DELETED = Symbol('ITEM_COMMENT_DELETED');
  export const ITEM_RESPONSE_DELETED = Symbol('ITEM_RESPONSE_DELETED');

  export interface CommentItem extends Omit<SocialResourceViewer.CommentItem, 'responses'> {
    type: typeof ITEM_COMMENT;
    nbResponses: number;
  }
  export interface CommentItemDeleted extends Omit<SocialResourceViewer.CommentItemDeleted, 'responses'> {
    type: typeof ITEM_COMMENT_DELETED;
    nbResponses: number;
  }
  export interface ResponseItem extends SocialResourceViewer.ResponseItem {
    type: typeof ITEM_RESPONSE;
    inReplyTo: CommentItem['id'];
    inReplyToIndex: number;
    hasResponses: boolean;
  }
  export interface ResponseItemDeleted extends SocialResourceViewer.ResponseItemDeleted {
    type: typeof ITEM_RESPONSE_DELETED;
    inReplyTo: CommentItem['id'];
    inReplyToIndex: number;
    hasResponses: boolean;
  }
  export interface ResponseItemEllipsis extends SocialResourceViewer.ResponseItemEllipsis {
    type: typeof ITEM_RESPONSE_ELLIPSIS;
    inReplyTo: CommentItem['id'];
    inReplyToIndex: number;
    hasResponses: boolean;
  }
  export interface AddResponseItem {
    type: typeof ITEM_ADD_RESPONSE;
    inReplyTo: CommentItem['id'];
    inReplyToIndex: number;
    value: string;
    isRichContent?: boolean;
  }

  export type Item = CommentItem | ResponseItem | CommentItemDeleted | ResponseItemDeleted | ResponseItemEllipsis | AddResponseItem;

  export interface ContextState {
    newCommentHeight: number;
    newCommentValue: string;
    newResponseValue?: string;
    newResponseReplyTo?: SocialResourceViewerInternals.CommentItem['id'];
    editId?: SocialResourceViewerInternals.ResponseItem['id'];
    editValue?: string;
    editHasChanges?: boolean;
  }
  export type ContextAction =
    | Pick<ContextState, 'newCommentHeight'>
    | Pick<ContextState, 'newCommentValue'>
    | Required<Pick<ContextState, 'newResponseReplyTo' | 'newResponseValue'>>
    | { newResponseReplyTo: undefined; newResponseValue: undefined }
    | Required<Pick<ContextState, 'editId' | 'editValue' | 'editHasChanges'>>
    | { editId: undefined; editValue: undefined; editHasChanges: undefined };

  export type ContextReducer = (state: ContextState, newValues: ContextAction) => ContextState;
  export type Context = [ContextState, React.ActionDispatch<[ContextAction]>];

  export interface ItemProps
    extends
      ListRenderItemInfo<SocialResourceViewerInternals.Item>,
      Partial<Pick<SocialResourceViewer.CommentsConfig, 'allowResponses'>> {
    onShowResponses?: (id: string, start: number, count: number) => void;
    canAddComment?: boolean;
    onPressReply?: (item: SocialResourceViewerInternals.CommentItem, index: number) => void;
    onSendReply?: SocialResourceViewer.Props['onSubmit'];
    onSendEdit?: SocialResourceViewer.Props['onEdit'];
    inputRef?: ChatTextAreaProps['ref'];
    listRef?: React.RefObject<FlatList<SocialResourceViewerInternals.Item> | null>;
    onPressEdit?: (
      item: SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem,
      index: number,
    ) => void;
    onPressDelete?: (
      item: SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem,
      index: number,
    ) => void;
  }
}
