/**
 * Home of « Mes applis »: the apps of the user, by filter (categories, favorites, search), with pull-to-refresh.
 */
import * as React from 'react';
import { Keyboard, View } from 'react-native';

import { StaticScreenProps, useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { FlashListRef } from '@shopify/flash-list';

import { defineScreen } from '~/app/navigation-new';
import { EmptyScreen } from '~/framework/components/empty-screens';
import Feedback from '~/framework/util/feedback/feedback';
import { MyAppsFilters } from '~/modules/myapps/components/my-apps-filters/component';
import { MyAppsList } from '~/modules/myapps/components/my-apps-list/component';
import type { MyAppsListItem } from '~/modules/myapps/components/my-apps-list/types';
import { useEntApps, useFavorites, useFilteredApps, useHasAppsToList } from '~/modules/myapps/hooks';
import type { ListedApp, MyAppsFilter } from '~/modules/myapps/model';
import { Loading } from '~/ui/Loading';
import { I18n } from '~/util/i18n';

import { headerRight, headerRightItems } from './header';
import { styles } from './styles';

/** Empty screen of a filter that lists nothing. */
const EMPTY_SCREEN_CONFIG = {
  favorites: {
    testID: 'myapps-empty-favorites',
    text: 'myapp-empty-screen-favorite-text',
    title: 'myapp-empty-screen-favorite-title',
  },
  other: { testID: 'myapps-empty-other', text: 'myapp-empty-screen-other-text', title: 'myapp-empty-screen-other-title' },
  search: { testID: 'myapps-empty-search', text: 'myapp-empty-screen-search-text', title: 'myapp-empty-screen-search-title' },
};

const getEmptyScreenConfig = (filter: MyAppsFilter) =>
  filter.type === 'favorites' || filter.type === 'search' ? EMPTY_SCREEN_CONFIG[filter.type] : EMPTY_SCREEN_CONFIG.other;

function MyAppsHomeScreen({}: StaticScreenProps<undefined>) {
  const [filter, setFilter] = React.useState<MyAppsFilter>({ type: 'all' });
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
  useFocusEffect(
    React.useCallback(
      () => () => {
        Keyboard.dismiss();
        setFilter(current => (current.type === 'search' ? { type: 'all' } : current));
      },
      [],
    ),
  );

  const onPressApp = React.useCallback<(item: ListedApp) => void>(() => {
    // ToDo(myapps-migration): phase 6, open the app: its module if `useCanOpenModule` (module of `useAppModules`), else `openUrl(getAppUrl(address, session.platform.url))`
  }, []);

  const onLongPressApp = React.useCallback<(item: ListedApp) => void>(() => {
    Feedback.longPress();
    // ToDo(myapps-migration): phase 5, open `myapps/app-actions` (favorite, help)
  }, []);

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
  options: () => ({
    headerRight,
    title: I18n.get('myapp-appname'),
    unstable_headerRightItems: headerRightItems,
  }),
  screen: MyAppsHomeScreen,
});
