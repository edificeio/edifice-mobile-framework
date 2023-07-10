import * as React from 'react';

import HorizontalList from '~/framework/components/list/horizontal';
import ThreadItem, { ThreadItemStatus } from '~/framework/modules/news/components/thread-item';
import { NewsThreadItem } from '~/framework/modules/news/model';

import styles from './styles';
import { ThreadsSelectorProps } from './types';

export default function ThreadsSelector(props: ThreadsSelectorProps) {
  const [selectedId, setSelectedId] = React.useState(null);

  const onSelect = id => {
    if (props.isFiltering) return;
    if (id === selectedId) {
      props.onSelect(null);
      setSelectedId(null);
      return;
    }
    props.onSelect(id);
    setSelectedId(id);
  };

  const renderItem = (thread: NewsThreadItem) => {
    const isSelected = selectedId === thread.id;

    if (isSelected) return <ThreadItem status={ThreadItemStatus.SELECTED} thread={thread} onSelect={onSelect} />;
    if (!isSelected && selectedId) return <ThreadItem status={ThreadItemStatus.DISABLED} thread={thread} onSelect={onSelect} />;
    return <ThreadItem status={ThreadItemStatus.DEFAULT} thread={thread} onSelect={onSelect} />;
  };

  return <HorizontalList data={props.threads} renderItem={({ item }) => renderItem(item)} style={styles.list} />;
}
