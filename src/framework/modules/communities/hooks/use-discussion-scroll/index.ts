import * as React from 'react';

import { FlashListRef } from '@shopify/flash-list';

import { PaginatedListItem } from '~/framework/components/list/paginated-list';
import toast from '~/framework/components/toast';
import { DiscussionMessage } from '~/framework/modules/communities/adapter';
import { ScrollTarget } from '~/framework/modules/communities/hooks/use-discussion-messages';

import { UseDiscussionScroll, UseDiscussionScrollParams } from './types';

export function useDiscussionScroll({
  collapsedBandHeight,
  consumeInitialTarget,
  isLastPageLoaded,
  loadLastPage,
  messages,
}: UseDiscussionScrollParams): UseDiscussionScroll {
  const scrollRef = React.useRef<FlashListRef<PaginatedListItem<DiscussionMessage>>>(null);
  // The loaded messages must be rendered and measured before scrolling to the end, else the list stops on the previous
  // latest message, or above the new one.
  const messagesRef = React.useRef(messages);
  messagesRef.current = messages;
  const pendingScrollToEndFromRef = React.useRef<typeof messages>(undefined);

  const initialScrollIndexParams = React.useMemo(() => ({ viewOffset: -collapsedBandHeight }), [collapsedBandHeight]);

  const scrollTo = React.useCallback(
    (target: ScrollTarget) => {
      if (target === 'end') scrollRef.current?.scrollToEnd({ animated: false });
      // Add `viewOffset` to the item position: negative, leaves room for the header band
      else scrollRef.current?.scrollToIndex({ animated: false, index: target, viewOffset: -collapsedBandHeight });
    },
    [collapsedBandHeight],
  );
  const scrollToEnd = React.useCallback(() => scrollTo('end'), [scrollTo]);

  // Wait for the list to render before trigger the scroll
  const onCommitLayoutEffect = React.useCallback(() => {
    if (pendingScrollToEndFromRef.current === undefined || pendingScrollToEndFromRef.current === messagesRef.current) return;
    pendingScrollToEndFromRef.current = undefined;
    scrollToEnd();
  }, [scrollToEnd]);

  const goToLatestMessage = React.useCallback((loading: Promise<unknown>) => {
    pendingScrollToEndFromRef.current = messagesRef.current;
    loading.catch(e => {
      pendingScrollToEndFromRef.current = undefined;
      console.error('Error while reloading community discussion messages', e);
      toast.showError();
    });
  }, []);

  const onPressLatestReply = React.useCallback(() => {
    if (isLastPageLoaded()) scrollToEnd();
    else goToLatestMessage(loadLastPage());
  }, [goToLatestMessage, isLastPageLoaded, loadLastPage, scrollToEnd]);

  // The list already opens on its target: scrolling to it again once loaded puts the latest message at the bottom of the
  // screen (`initialScrollIndex` puts it at the top).
  const onLoad = React.useCallback(() => {
    if (!scrollRef.current) return;
    const target = consumeInitialTarget();
    if (target !== undefined) scrollTo(target);
  }, [consumeInitialTarget, scrollTo]);

  return { goToLatestMessage, initialScrollIndexParams, onCommitLayoutEffect, onLoad, onPressLatestReply, scrollRef };
}

export type { UseDiscussionScroll, UseDiscussionScrollParams } from './types';
