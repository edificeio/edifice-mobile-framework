import * as React from 'react';

import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { NEWS_COUNT } from '~/framework/modules/home/components/news/constants';
import type { HomeNewsItem } from '~/framework/modules/home/components/news/types';
import { getNewsItemsAction, getNewsThreadsAction } from '~/framework/modules/news/actions';
import type { NewsItem, NewsThreadItem } from '~/framework/modules/news/model';
import { getNewsRights } from '~/framework/modules/news/rights';

export function useHomeNews(session: AuthActiveAccount) {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const canView = getNewsRights(session).view;

  const [news, setNews] = React.useState<HomeNewsItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(canView);

  const load = React.useCallback(async () => {
    if (!canView) return;
    setLoading(true);

    try {
      // The list only gives a `threadId`, the threads carry the icon and the name to show.
      const [threads, items] = await Promise.all([
        dispatch(getNewsThreadsAction()) as unknown as Promise<NewsThreadItem[]>,
        dispatch(getNewsItemsAction(0)) as unknown as Promise<NewsItem[]>,
      ]);
      const threadsById = new Map(threads.map(thread => [thread.id, thread]));

      setNews(
        items.slice(0, NEWS_COUNT).reduce<HomeNewsItem[]>((acc, item) => {
          const thread = threadsById.get(item.threadId);
          if (thread)
            acc.push({
              news: item,
              thread: { icon: thread.icon, ownerId: thread.owner.id, sharedRights: thread.sharedRights, title: thread.title },
            });
          return acc;
        }, []),
      );
    } finally {
      setLoading(false);
    }
  }, [canView, dispatch]);

  return { canView, load, loading, news };
}
