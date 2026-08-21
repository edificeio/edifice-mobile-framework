import { StyleProp, ViewStyle } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AccountType } from '~/framework/modules/auth/model';

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
    count: number;
  }
  export interface CommentItem extends CommonContentItemData, CommentCommentItemData {}
  export interface CommentItemDeleted extends CommonDeletedItemData, CommentCommentItemData {}

  export interface Props extends Pick<NativeStackScreenProps<ParamListBase>, 'navigation'>, React.PropsWithChildren {
    canAddComment: boolean;
    alwaysShowCommentField?: boolean;
    style?: StyleProp<ViewStyle>;
    data: (CommentItem | CommentItemDeleted)[];
    onSubmit?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
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
    hasResponses: boolean;
  }
  export interface CommentItemDeleted extends Omit<SocialResourceViewer.CommentItemDeleted, 'responses'> {
    type: typeof ITEM_COMMENT_DELETED;
    hasResponses: boolean;
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
}
