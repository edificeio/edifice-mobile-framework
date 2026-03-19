import { StyleProp, ViewStyle } from 'react-native';

import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export namespace SocialResourceViewer {
  export interface Props extends Pick<NativeStackScreenProps<ParamListBase>, 'navigation'>, React.PropsWithChildren {
    canAddComment: boolean;
    alwaysShowCommentField?: boolean;
    style?: StyleProp<ViewStyle>;
    comments: (CommentItem | ResponseItem)[];
  }
}

export const ITEM_ADD_RESPONSE = Symbol('ITEM_ADD_RESPONSE');
export const ITEM_COMMENT = Symbol('ITEM_COMMENT');
export const ITEM_RESPONSE = Symbol('ITEM_RESPONSE');

interface CommentItem {
  type: typeof ITEM_COMMENT;
  value: string;
}

interface ResponseItem {
  type: typeof ITEM_RESPONSE;
  value: string;
}

interface AddResponseItem {
  type: typeof ITEM_ADD_RESPONSE;
  value: string;
  commentId: string;
}

export type SocialResourceViewerItemType = CommentItem | ResponseItem | AddResponseItem;
