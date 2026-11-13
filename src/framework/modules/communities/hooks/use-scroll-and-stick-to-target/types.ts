import type { FlashListRef } from '@shopify/flash-list';

export type ScrollTarget = 'end' | number;

export interface UseScrollAndStickToTarget {
  onContentSizeChange: () => void;
  scrollAndStickTo: (target: ScrollTarget) => void;
  stopSticking: () => void;
}

export interface UseScrollAndStickToTargetParams<T> {
  listRef: React.RefObject<FlashListRef<T> | null>;
  /** Added by FlashList to the position of the target item: negative to leave room above it (e.g. for a header over the list). */
  viewOffset?: number;
}
