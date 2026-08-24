import React from 'react';
import { RefreshControl } from 'react-native';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';

import { I18n } from '~/app/i18n';
import ScrollView from '~/framework/components/scrollView';
import { withSession } from '~/framework/modules/auth/util';
import { FlashMessageList, NewsSection } from '~/framework/modules/home/components';
import type { HomeNewsItem } from '~/framework/modules/home/components/news/types';
import { useFlashMessages, useHomeNews, useHomeReload, useRefresh } from '~/framework/modules/home/hooks';
import { newsRouteNames } from '~/framework/modules/news/navigation';

import styles from './styles';
import { HomeOverviewScreenProps } from './types';

export const HomeOverviewScreenOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-overview',
  title: I18n.get('home-overview-title'),
});

export const HomeOverviewScreen = withSession<HomeOverviewScreenProps>(({ navigation, session }) => {
  const { dismiss: onDismissFlashMessage, load: loadFlashMessages, pristine, visible: flashMessages } = useFlashMessages();
  const { canView: canViewNews, load: loadNews, loading: newsLoading, news } = useHomeNews(session);

  const reload = React.useCallback(async () => {
    await Promise.all([loadFlashMessages(), loadNews()]);
  }, [loadFlashMessages, loadNews]);

  // everything is fetched again
  // every time the tab is opened
  const reloading = useHomeReload(reload);

  const { onRefresh, refreshing } = useRefresh(reload);

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
    <ScrollView contentContainerStyle={styles.content} refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
      <FlashMessageList
        flashMessages={flashMessages}
        loading={pristine || refreshing || reloading}
        onDismiss={onDismissFlashMessage}
      />

      <NewsSection canView={canViewNews} loading={newsLoading} news={news} onPressItem={onOpenNews} onSeeMore={onSeeMorePress} />
    </ScrollView>
  );
});
