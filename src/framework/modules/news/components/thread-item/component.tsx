import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import styles from './styles';
import { ThreadItemProps, ThreadItemStatus } from './types';

import { CaptionBoldText, CaptionText } from '~/framework/components/text';
import ThumbnailThread from '~/framework/modules/news/components/thumbnail-thread';

export default function ThreadItem(props: ThreadItemProps) {
  const { status, thread } = props;

  const renderTextItem = () => {
    if (status === ThreadItemStatus.SELECTED) {
      return (
        <CaptionBoldText numberOfLines={2} style={styles.textItem}>
          {thread.title}
        </CaptionBoldText>
      );
    }
    if (status === ThreadItemStatus.DISABLED) {
      return (
        <CaptionText numberOfLines={2} style={[styles.textItem, styles.textItemNotSelected]}>
          {thread.title}
        </CaptionText>
      );
    }
    return (
      <CaptionText numberOfLines={2} style={styles.textItem}>
        {thread.title}
      </CaptionText>
    );
  };

  return (
    <TouchableOpacity onPress={() => props.onSelect(thread.id)} style={styles.item}>
      <ThumbnailThread icon={thread.icon} status={status} />
      {renderTextItem()}
    </TouchableOpacity>
  );
}
