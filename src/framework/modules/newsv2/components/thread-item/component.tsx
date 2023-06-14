import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import { CaptionText } from '~/framework/components/text';
import ThumbnailThread from '~/framework/modules/newsv2/components/thumbnail-thread';

import styles from './styles';
import { ThreadItemProps, ThreadItemStatus } from './types';

export default function ThreadItem(props: ThreadItemProps) {
  const { status, thread } = props;

  const renderTextItem = () => {
    if (status === ThreadItemStatus.SELECTED) {
      return (
        <CaptionText numberOfLines={2} style={[styles.textItem, styles.textItemSelected]}>
          {thread.title}
        </CaptionText>
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
