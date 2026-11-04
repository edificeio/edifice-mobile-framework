/**
 * Home of « Mes applis »: the apps of the user, by filter (categories, favorites, search), with pull-to-refresh.
 */
import * as React from 'react';
import { Keyboard, View } from 'react-native';

import { StaticScreenProps, useFocusEffect, useNavigation, useScrollToTop } from '@react-navigation/native';
import { FlashListRef } from '@shopify/flash-list';

import { defineScreen } from '~/app/navigation-new';
import { EmptyScreen } from '~/framework/components/empty-screens';
import Feedback from '~/framework/util/feedback/feedback';
import { MyAppsFilters } from '~/modules/myapps/components/my-apps-filters/component';
import { MyAppsList } from '~/modules/myapps/components/my-apps-list/component';
import type { MyAppsListItem } from '~/modules/myapps/components/my-apps-list/types';
import { EMPTY_SCREEN_CONFIG } from '~/modules/myapps/components/my-apps-list/utils';
import { useEntApps, useFavorites, useFilteredApps, useHasAppsToList, useOpenApp } from '~/modules/myapps/hooks';
import type { ListedApp, MyAppsFilter } from '~/modules/myapps/model';
import { Loading } from '~/ui/Loading';
import { I18n } from '~/util/i18n';

import { homeHeaderActions } from './header';
import { useAutoOnboarding } from './hooks';
import { styles } from './styles';

type MyAppsHomeParams = {
  /** The filter of the list: « all » without it. */
  filter?: MyAppsFilter;
};

const ALL_APPS: MyAppsFilter = { type: 'all' };

const getEmptyScreenConfig = (filter: MyAppsFilter) =>
  filter.type === 'favorites' || filter.type === 'search' ? EMPTY_SCREEN_CONFIG[filter.type] : EMPTY_SCREEN_CONFIG.other;

function MyAppsHomeScreen({ route }: StaticScreenProps<MyAppsHomeParams | undefined>) {
  const navigation = useNavigation();
  // In the params: the buttons of the header read it (the menu depends on it)
  const filter = route.params?.filter ?? ALL_APPS;
  const setFilter = React.useCallback((next: MyAppsFilter) => navigation.setParams({ filter: next }), [navigation]);

  const apps = useFilteredApps(filter);
  const hasApps = useHasAppsToList();
  const { refresh, status: appsStatus } = useEntApps();
  const { status: favoritesStatus } = useFavorites();
  const hasFetchError = appsStatus === 'error' || favoritesStatus === 'error';

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  // Back to the top of the list when its tab is pressed again (§4 n° 10)
  const listRef = React.useRef<FlashListRef<MyAppsListItem>>(null);
  useScrollToTop(listRef as React.RefObject<FlashListRef<MyAppsListItem>>);

  // The search is closed when the screen is left (a modal opens over it…)
  const closeSearch = React.useEffectEvent(() => {
    Keyboard.dismiss();
    if (filter.type === 'search') setFilter(ALL_APPS);
  });
  useFocusEffect(React.useCallback(() => () => closeSearch(), []));

  useAutoOnboarding();

  const openApp = useOpenApp();
  const onPressApp = React.useCallback((item: ListedApp) => openApp(item.app), [openApp]);

  const onLongPressApp = React.useCallback(
    (item: ListedApp) => {
      Feedback.longPress();
      navigation.navigate('myapps/app-actions', { appName: item.app.name });
    },
    [navigation],
  );

  if (!hasApps && refreshing) return <Loading />;

  if (!hasApps)
    return (
      <View style={styles.emptyScreen}>
        <EmptyScreen
          title={I18n.get('myapp-empty-screen-home-title')}
          text={I18n.get('myapp-empty-screen-home-text')}
          svgImage="empty-content"
          {...(hasFetchError && { buttonAction: onRefresh, buttonIcon: 'ui-refresh', buttonText: I18n.get('myapp-retry') })}
          testID="myapps-empty-screen"
        />
      </View>
    );

  return (
    <>
      <MyAppsFilters selectedFilter={filter} onFilterChange={setFilter} />
      <MyAppsList
        ref={listRef}
        apps={apps}
        emptyScreenConfig={getEmptyScreenConfig(filter)}
        isAllAppsFilter={filter.type === 'all'}
        onPressApp={onPressApp}
        onLongPressApp={onLongPressApp}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </>
  );
}

export default defineScreen({
  options: ({ route }) => ({
    title: I18n.get('myapp-appname'),
    ...homeHeaderActions(route.params?.filter),
  }),
  screen: MyAppsHomeScreen,
});
