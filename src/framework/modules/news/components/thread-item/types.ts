import { NewsThreadItem } from '~/framework/modules/news/model';

export interface ThreadItemProps {
  status: ThreadItemStatus;
  thread: NewsThreadItem;
  onSelect: (threadId: number) => void;
}

export enum ThreadItemStatus {
  SELECTED,
  DISABLED,
  DEFAULT,
}
