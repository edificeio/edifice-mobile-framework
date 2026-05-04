import * as React from 'react';
import { Keyboard } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';

import { BottomSheetMode } from './types';

import { I18n } from '~/app/i18n';
import AllModules from '~/app/modules';
import { AppDispatch } from '~/app/store';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { MyAppsListItem } from '~/framework/modules/myapps/components/my-apps-list/types';
import { useFilteredApps } from '~/framework/modules/myapps/hooks';
import { isNavigableModule, refreshMyApps, selectAggregatedApps, toggleFavorite } from '~/framework/modules/myapps/reducer';
import {
  readMyAppsOnboardingSeen,
  readShowAllApps,
  writeMyAppsOnboardingSeen,
  writeShowAllApps,
} from '~/framework/modules/myapps/storage';
import { AppsInfoAggregated, MyAppsFilter, MyAppsFilterCategories, MyAppsFilterTypes } from '~/framework/modules/myapps/types';
import { getModuleRouteName } from '~/framework/modules/myapps/utils';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import { openUrl } from '~/framework/util/linking';
import { IEntcoreApp } from '~/framework/util/moduleTool';

/**
 * gonna allow us to display again modal if we made updates or wana show it again
 */
const ONBOARDING_VERSION = 'v1';
const autoShownOnboardingSessionKeys = new Set<string>();

export function useMyAppsHomeController() {
  const navigation = useNavigation() as any;
  const dispatch = useDispatch<AppDispatch>();

  const modalRef = React.useRef<ModalBoxHandle>(null);
  const pendingToastRef = React.useRef<null | { type: 'success' | 'error'; message: string }>(null);
  const pendingToggleRef = React.useRef<string | null>(null);
  const appsListRef = React.useRef<FlashList<MyAppsListItem>>(null);

  const [filter, setFilter] = React.useState<MyAppsFilter>({ type: MyAppsFilterTypes.Category, value: MyAppsFilterCategories.all });
  const [selectedApp, setSelectedApp] = React.useState<AppsInfoAggregated | null>(null);
  const [bottomSheetMode, setBottomSheetMode] = React.useState<'home_menu' | 'app_actions'>('home_menu');
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = React.useState<boolean>(false);
  const [areAppsShowed, setAreAppsShowed] = React.useState(readShowAllApps());

  const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState<boolean>(() => {
    const onboarding = readMyAppsOnboardingSeen();
    return Boolean(onboarding?.seen);
  });

  const aggregatedApps = useSelector(selectAggregatedApps);
  const apps = useFilteredApps(filter);
  const isAllAppsTab = filter.type === MyAppsFilterTypes.Category && filter.value === MyAppsFilterCategories.all;

  const isAggregatedAppsEmpty = React.useMemo(
    () => !aggregatedApps || !Object.values(aggregatedApps).some(app => app.display),
    [aggregatedApps],
  );

  const isFavoritesFilter = React.useMemo(() => filter.type === MyAppsFilterTypes.Favorites, [filter]);

  const queueToast = React.useCallback((type: 'success' | 'error', message: string) => {
    pendingToastRef.current = { message, type };
  }, []);

  const displayToast = React.useCallback(() => {
    const t = pendingToastRef.current;
    if (!t) return;

    pendingToastRef.current = null;

    t.type === 'success' ? Toast.showSuccess(t.message) : Toast.showError(t.message);
  }, []);

  const getLoginSessionKey = React.useCallback(() => {
    const session = getSession();
    if (!session) return undefined;
    return `${session.user.id}:${session.tokens.access.value}`;
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loginSessionKey = getLoginSessionKey();
      if (!loginSessionKey) return;

      const onboarding = readMyAppsOnboardingSeen();
      const alreadySeen = Boolean(onboarding?.seen);
      setHasSeenOnboarding(alreadySeen);

      const shouldShow =
        !alreadySeen && onboarding?.version !== ONBOARDING_VERSION && !autoShownOnboardingSessionKeys.has(loginSessionKey);

      if (shouldShow) {
        autoShownOnboardingSessionKeys.add(loginSessionKey);
        requestAnimationFrame(() => modalRef.current?.doShowModal());
      }
    }, [getLoginSessionKey]),
  );

  const handleDismissSearch = React.useCallback(() => {
    Keyboard.dismiss();
    if (filter.type === MyAppsFilterTypes.Search)
      setFilter({ type: MyAppsFilterTypes.Category, value: MyAppsFilterCategories.all });
  }, [filter]);

  const openBottomSheet = React.useCallback(
    (mode: BottomSheetMode, app?: AppsInfoAggregated) => {
      handleDismissSearch();
      setSelectedApp(app ?? null);
      setBottomSheetMode(mode);
      navigation.setParams({ tabBarVisible: false });
      setIsBottomSheetVisible(true);
    },
    [handleDismissSearch, navigation],
  );

  const handleOpenOnboarding = React.useCallback(() => {
    handleDismissSearch();
    modalRef.current?.doShowModal();
  }, [handleDismissSearch]);

  const closeBottomSheet = React.useCallback(() => {
    setSelectedApp(null);
    navigation.setParams({ tabBarVisible: true });
    setIsBottomSheetVisible(false);
  }, [navigation]);

  const onPressApp = React.useCallback(
    (app: AppsInfoAggregated) => {
      if (app.routeName) {
        const session = getSession();
        const modules = AllModules().filterAvailables(session!).filter(isNavigableModule);
        const routeName = getModuleRouteName(app as IEntcoreApp, modules);
        if (routeName) {
          navigation.navigate(routeName);
        }
      } else {
        openUrl(app.address);
      }
    },
    [navigation],
  );

  const onToggleFavorite = React.useCallback(
    (appName: string) => () => {
      pendingToggleRef.current = appName;

      closeBottomSheet();
    },
    [closeBottomSheet],
  );

  const handleDismiss = React.useCallback(() => {
    navigation.setParams({ tabBarVisible: true });
    const appName = pendingToggleRef.current;

    if (!appName) {
      displayToast();
      return;
    }

    pendingToggleRef.current = null;

    dispatch(
      toggleFavorite(appName, ok => {
        queueToast(
          ok ? 'success' : 'error',
          I18n.get(ok ? 'myapp-add-favorite-success-message' : 'myapp-add-favorite-error-message'),
        );

        displayToast();
      }),
    );
  }, [dispatch, displayToast, navigation, queueToast]);

  const onToggleAllApps = React.useCallback(() => {
    setAreAppsShowed(prev => {
      const newValue = !prev;
      writeShowAllApps(newValue);
      return newValue;
    });
  }, []);

  const completeOnboarding = React.useCallback(() => {
    writeMyAppsOnboardingSeen(ONBOARDING_VERSION);
    setHasSeenOnboarding(true);
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(refreshMyApps());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  //Listens to tab press to scroll to top of the list
  React.useEffect(() => {
    const unsubscribe = navigation.getParent('tabs')?.addListener('tabPress', () => {
      appsListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    });
    return unsubscribe;
  }, [navigation]);

  return {
    apps,
    appsListRef,
    areAppsShowed,
    bottomSheetMode,
    closeBottomSheet,
    completeOnboarding,
    filter,
    handleDismiss,
    handleOpenOnboarding,
    hasSeenOnboarding,
    isAggregatedAppsEmpty,
    isAllAppsTab,
    isBottomSheetVisible,
    isFavoritesFilter,
    modalRef,
    navigateToFavorites: () => navigation.navigate(ModalsRouteNames.FavoritesManagement),
    onPressApp,
    onRefresh,
    onToggleAllApps,
    onToggleFavorite,
    openBottomSheet,
    refreshing,
    selectedApp,
    setFilter,
  };
}
