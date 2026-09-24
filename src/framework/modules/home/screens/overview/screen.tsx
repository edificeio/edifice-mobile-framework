import React from 'react';
import { RefreshControl } from 'react-native';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';

import { I18n } from '~/app/i18n';
import { UI_STYLES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import ScrollView from '~/framework/components/scrollView';
import { withSession } from '~/framework/modules/auth/util';
import { FlashMessageSection } from '~/framework/modules/home/components';
import type { HomeNewsItem } from '~/framework/modules/news/components/home-section/types';
import { useFlashMessages, useHomeReload, useRefresh } from '~/framework/modules/home/hooks';
import { hasNews, NewsSection } from '~/framework/modules/news/components/home-section';
import { useHomeNews } from '~/framework/modules/news/hooks';
import { hasWidgets, WidgetsSection } from '~/framework/modules/widgets/components/home-section';
import { newsRouteNames } from '~/framework/modules/news/navigation';
import { useCarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/hooks';
import type { CarnetDeBordSection, ICarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/model';
import { pronoteRouteNames } from '~/framework/modules/widgets/carnet-de-board/navigation';

import styles from './styles';
import { HomeOverviewScreenProps } from './types';

export const HomeOverviewScreenOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-overview',
  title: I18n.get('home-overview-title'),
});

export const HomeOverviewScreen = withSession<HomeOverviewScreenProps>(({ navigation, session }) => {
  const { dismiss: onDismissFlashMessage, load: loadFlashMessages, pristine, visible: flashMessages } = useFlashMessages();
  const { load: loadNews, loading: newsLoading, news } = useHomeNews(session);
  const { load: loadCarnetDeBord, loading: carnetDeBordLoading } = useCarnetDeBord();

  // Each block shows its own failure, so one of them going down must not take the reload with it.
  const reload = React.useCallback(async () => {
    await Promise.allSettled([loadFlashMessages(), loadNews(), loadCarnetDeBord()]);
  }, [loadCarnetDeBord, loadFlashMessages, loadNews]);

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

  const onOpenCarnetDeBord = React.useCallback(() => navigation.navigate(pronoteRouteNames.carnetDeBordModal), [navigation]);

  const onOpenCarnetDeBordSection = React.useCallback(
    (section: CarnetDeBordSection, data: ICarnetDeBord) =>
      navigation.navigate(pronoteRouteNames.carnetDeBordModal, {
        params: { data, type: section },
        screen: pronoteRouteNames.carnetDeBordDetails,
      }),
    [navigation],
  );

  // Every section hides itself when it has nothing to show, and the page is no list, so it would be
  // left blank. The first load is waited for, or this would flash on every opening.
  const isEmpty = !pristine && !flashMessages.length && !hasNews(session) && !hasWidgets(session);

  return (
    <ScrollView
      style={UI_STYLES.flex1}
      contentContainerStyle={isEmpty ? styles.emptyContent : styles.content}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}>
      {isEmpty ? (
        <EmptyScreen
          svgImage="empty-hammock"
          title={I18n.get('home-overview-empty-title')}
          text={I18n.get('home-overview-empty-text')}
        />
      ) : (
        <React.Fragment>
          <FlashMessageSection
            flashMessages={flashMessages}
            loading={pristine || refreshing || reloading}
            onDismiss={onDismissFlashMessage}
          />

          <NewsSection session={session} loading={newsLoading} news={news} onPressItem={onOpenNews} onSeeMore={onSeeMorePress} />

          <WidgetsSection
            session={session}
            carnetDeBordLoading={carnetDeBordLoading}
            onOpenCarnetDeBord={onOpenCarnetDeBord}
            onOpenCarnetDeBordSection={onOpenCarnetDeBordSection}
          />
        </React.Fragment>
      )}
    </ScrollView>
  );
});
