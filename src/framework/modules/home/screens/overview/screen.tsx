import * as React from 'react';
import { RefreshControl } from 'react-native';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import ScrollView from '~/framework/components/scrollView';
import { FlashMessageList, FlashMessagePlaceholder, NewsSection } from '~/framework/modules/home/components';
import { NEWS_COUNT } from '~/framework/modules/home/components/news/constants';
import type { HomeNewsItem } from '~/framework/modules/home/components/news/types';
import { getNewsItemsAction, getNewsThreadsAction } from '~/framework/modules/news/actions';
import type { NewsItem, NewsThreadItem } from '~/framework/modules/news/model';
import { NewsNavigationParams, newsRouteNames } from '~/framework/modules/news/navigation';
import { dismissFlashMessageAction, loadFlashMessagesAction } from '~/framework/modules/timeline/actions';
import timelineConfig from '~/framework/modules/timeline/module-config';

import styles from './styles';

// Options must stay a function: `I18n.init()` is async, so a key read at module scope would be raw.
export const HomeOverviewScreenOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-overview',
  title: I18n.get('home-overview-title'),
});

export function HomeOverviewScreen() {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const navigation = useNavigation<NavigationProp<NewsNavigationParams>>();
  // Flash messages still belongs to the timeline module, which owns their service and their store.
  const flashMessages = useSelector(state => timelineConfig.getState(state).flashMessages.data);

  const flashMessagesLoading = useSelector(state => {
    const { isFetching, isPristine } = timelineConfig.getState(state).flashMessages;
    return isPristine || isFetching;
  });

  const loadFlashMessages = React.useCallback(() => dispatch(loadFlashMessagesAction()), [dispatch]);

  React.useEffect(() => {
    loadFlashMessages();
  }, [loadFlashMessages]);

  const onDismiss = React.useCallback((id: number) => dispatch(dismissFlashMessageAction(id)), [dispatch]);

  const visibleFlashMessages = React.useMemo(() => flashMessages.filter(flashMessage => !flashMessage.dismiss), [flashMessages]);

  const [news, setNews] = React.useState<HomeNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = React.useState(true);

  const loadNews = React.useCallback(async () => {
    // The list gives a `threadId` only, so the threads are needed to show the icon and its name.
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
  }, [dispatch]);

  React.useEffect(() => {
    loadNews().finally(() => setNewsLoading(false));
  }, [loadNews]);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setNewsLoading(true);
    try {
      await Promise.all([loadFlashMessages(), loadNews()]);
    } finally {
      setRefreshing(false);
      setNewsLoading(false);
    }
  }, [loadFlashMessages, loadNews]);

  const refreshControl = React.useMemo(
    () => <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />,
    [onRefresh, refreshing],
  );

  const onSeeMorePress = React.useCallback(() => navigation.navigate(newsRouteNames.home, {}), [navigation]);

  const onOpenNews = React.useCallback(
    (item: HomeNewsItem) => navigation.navigate(newsRouteNames.details, { news: item.news, thread: item.thread }),
    [navigation],
  );

  return (
    <ScrollView contentContainerStyle={styles.content} refreshControl={refreshControl}>
      {flashMessagesLoading ? (
        <FlashMessagePlaceholder />
      ) : (
        <FlashMessageList flashMessages={visibleFlashMessages} onDismiss={onDismiss} />
      )}
      <NewsSection loading={newsLoading} news={news} onPressItem={onOpenNews} onSeeMore={onSeeMorePress} />
    </ScrollView>
  );
}
