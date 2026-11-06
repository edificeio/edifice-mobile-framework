import type * as React from 'react';

import type { FlashListRef } from '@shopify/flash-list';

import type { PaginatedListItem } from '~/framework/components/list/paginated-list';
import type { DiscussionMessage } from '~/framework/modules/communities/adapter';
import type { UseDiscussionMessages } from '~/framework/modules/communities/hooks/use-discussion-messages/types';

export interface UseDiscussionScroll {
  goToLatestMessage: (loading: Promise<unknown>) => void;
  initialScrollIndexParams: { viewOffset: number };
  onCommitLayoutEffect: () => void;
  onLoad: () => void;
  onPressLatestReply: () => void;
  scrollRef: React.RefObject<FlashListRef<PaginatedListItem<DiscussionMessage>> | null>;
}

export interface UseDiscussionScrollParams extends Pick<
  UseDiscussionMessages,
  'consumeInitialTarget' | 'isLastPageLoaded' | 'loadLastPage' | 'messages'
> {
  collapsedBandHeight: number;
}
