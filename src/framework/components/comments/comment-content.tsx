import React from 'react';
import { View } from 'react-native';

import styles from './styles';

import { SmallText } from '~/framework/components/text';

export interface CommentContentProps {
  deleted?: boolean;
  content: string;
}

export const CommentContent = ({ content, deleted }: CommentContentProps) => (
  <View
    style={React.useMemo(
      () => (deleted ? [styles.commentContent, styles.commentContentDeleted] : styles.commentContent),
      [deleted],
    )}>
    <SmallText>{content}</SmallText>
  </View>
);
