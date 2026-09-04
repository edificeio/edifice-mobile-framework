import React from 'react';
import { RefreshControl, View } from 'react-native';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import ScrollView from '~/framework/components/scrollView';
import { HeadingSText } from '~/framework/components/text';
import { withSession } from '~/framework/modules/auth/util';
import { FlashMessageList, NewsSection } from '~/framework/modules/home/components';
import type { HomeNewsItem } from '~/framework/modules/home/components/news/types';
import { useFlashMessages, useHomeNews, useHomeReload, useRefresh } from '~/framework/modules/home/hooks';
import { newsRouteNames } from '~/framework/modules/news/navigation';
import { CarnetDeBordWidget } from '~/framework/modules/widgets/carnet-de-board/components/home-widget';
import { useCarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/hooks/carnet-de-bord';
import type { CarnetDeBordSection, ICarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';
import { pronoteRouteNames } from '~/framework/modules/widgets/carnet-de-board/navigation';
import { canSeeCarnetDeBordWidget } from '~/framework/modules/widgets/carnet-de-board/rights';

import styles from './styles';
import { HomeOverviewScreenProps } from './types';

export const HomeOverviewScreenOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-overview',
  title: I18n.get('home-overview-title'),
});

export const HomeOverviewScreen = withSession<HomeOverviewScreenProps>(({ navigation, session }) => {
  const { dismiss: onDismissFlashMessage, load: loadFlashMessages, pristine, visible: flashMessages } = useFlashMessages();
  const { canView: canViewNews, load: loadNews, loading: newsLoading, news } = useHomeNews(session);
  const { load: loadCarnetDeBord, loading: carnetDeBordLoading } = useCarnetDeBord();

  const reload = React.useCallback(async () => {
    await Promise.all([loadFlashMessages(), loadNews(), loadCarnetDeBord()]);
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

  const showCarnetDeBord = React.useMemo(() => canSeeCarnetDeBordWidget(session), [session]);

  // Every section hides itself when it has nothing to show, and the page is no list, so it would be
  // left blank. The first load is waited for, or this would flash on every opening.
  const isEmpty = !pristine && !flashMessages.length && !canViewNews && !showCarnetDeBord;

  if (isEmpty)
    return (
      <EmptyScreen
        svgImage="empty-hammock"
        title={I18n.get('home-overview-empty-title')}
        text={I18n.get('home-overview-empty-text')}
      />
    );

  return (
    <ScrollView contentContainerStyle={styles.content} refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
      <FlashMessageList
        flashMessages={flashMessages}
        loading={pristine || refreshing || reloading}
        onDismiss={onDismissFlashMessage}
      />

      <NewsSection canView={canViewNews} loading={newsLoading} news={news} onPressItem={onOpenNews} onSeeMore={onSeeMorePress} />

      {showCarnetDeBord ? (
        <View style={styles.widgets}>
          <HeadingSText>{I18n.get('home-widgets-title')}</HeadingSText>
          <CarnetDeBordWidget
            session={session}
            loading={carnetDeBordLoading}
            onOpen={onOpenCarnetDeBord}
            onOpenSection={onOpenCarnetDeBordSection}
          />
        </View>
      ) : null}
    </ScrollView>
  );
});
