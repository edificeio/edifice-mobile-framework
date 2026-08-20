import { StyleProp, ViewStyle } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AccountType } from '~/framework/modules/auth/model';

export namespace SocialResourceViewer {
  export interface Props extends Pick<NativeStackScreenProps<ParamListBase>, 'navigation'>, React.PropsWithChildren {
    canAddComment: boolean;
    alwaysShowCommentField?: boolean;
    style?: StyleProp<ViewStyle>;
    comments: (CommentItem | ResponseItem | CommentItemDeleted | ResponseItemDeleted)[];
    onSubmit?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
  }
}

export const ITEM_ADD_RESPONSE = Symbol('ITEM_ADD_RESPONSE');
export const ITEM_SHOW_MORE_RESPONSES = Symbol('ITEM_SHOW_MORE_RESPONSES');
export const ITEM_COMMENT = Symbol('ITEM_COMMENT');
export const ITEM_RESPONSE = Symbol('ITEM_RESPONSE');
export const ITEM_COMMENT_DELETED = Symbol('ITEM_COMMENT_DELETED');
export const ITEM_RESPONSE_DELETED = Symbol('ITEM_RESPONSE_DELETED');

interface CommentData {
  value: string;
  id: string;
  authorId: string;
  authorName: string;
  authorAccountType: AccountType;
  date: Temporal.Instant;
  hasResponses: boolean;
}

export interface CommentItem extends CommentData {
  type: typeof ITEM_COMMENT;
}

export interface ResponseItem extends CommentData {
  type: typeof ITEM_RESPONSE;
  inReplyTo: CommentItem['id'];
}

export interface CommentItemDeleted extends Pick<CommentItem, 'id' | 'date' | 'hasResponses'> {
  type: typeof ITEM_COMMENT_DELETED;
}

export interface ResponseItemDeleted extends Pick<ResponseItem, 'id' | 'date' | 'hasResponses' | 'inReplyTo'> {
  type: typeof ITEM_RESPONSE_DELETED;
}

export interface AddResponseItem {
  type: typeof ITEM_ADD_RESPONSE;
  value: CommentData['value'];
  inReplyTo: CommentItem['id'];
}

export interface ShowMoreResponsesItem {
  type: typeof ITEM_SHOW_MORE_RESPONSES;
  inReplyTo: CommentItem['id'];
}

export type SocialResourceViewerItemType = CommentItem | ResponseItem | CommentItemDeleted | ResponseItemDeleted | AddResponseItem;
