import { NewsThreadItem } from '~/framework/modules/newsv2/model';

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
