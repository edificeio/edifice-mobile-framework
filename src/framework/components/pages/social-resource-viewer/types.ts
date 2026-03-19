import { StyleProp, ViewStyle } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export namespace SocialResourceViewer {
  export interface Props extends Pick<NativeStackScreenProps<ParamListBase>, 'navigation'>, React.PropsWithChildren {
    canAddComment: boolean;
    alwaysShowCommentField?: boolean;
    style?: StyleProp<ViewStyle>;
    comments: (CommentItem | ResponseItem)[];
    onSubmit?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
  }
}

export const ITEM_ADD_RESPONSE = Symbol('ITEM_ADD_RESPONSE');
export const ITEM_COMMENT = Symbol('ITEM_COMMENT');
export const ITEM_RESPONSE = Symbol('ITEM_RESPONSE');

interface CommentData {
  value: string;
  id: string;
  authorId: string;
  authorName: string;
  date: Temporal.Instant;
}

export interface CommentItem extends CommentData {
  type: typeof ITEM_COMMENT;
}

export interface ResponseItem extends CommentData {
  type: typeof ITEM_RESPONSE;
  inReplyTo: CommentItem['id'];
}

export interface AddResponseItem {
  type: typeof ITEM_ADD_RESPONSE;
  value: CommentData['value'];
  inReplyTo: CommentItem['id'];
}

export type SocialResourceViewerItemType = CommentItem | ResponseItem | AddResponseItem;
