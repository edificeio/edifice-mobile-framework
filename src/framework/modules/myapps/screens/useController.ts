import * as React from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';

import { BottomSheetMode } from './types';

import { I18n } from '~/app/i18n';
import AllModules from '~/app/modules';
import { AppDispatch } from '~/app/store';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import { MyAppsListItem } from '~/framework/modules/myapps/components/my-apps-list/types';
import { useFilteredApps } from '~/framework/modules/myapps/hooks';
import {
  getAllappsShowedState,
  isNavigableModule,
  refreshMyApps,
  selectAggregatedApps,
  toggleAllApps,
  toggleFavorite,
} from '~/framework/modules/myapps/reducer';
import { readMyAppsOnboarding, writeMyAppsOnboardingSeen } from '~/framework/modules/myapps/storage';
import { AppsInfoAggregated, MyAppsFilter } from '~/framework/modules/myapps/types';
import { getModuleRouteName } from '~/framework/modules/myapps/utils';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import { openUrl } from '~/framework/util/linking';
import { IEntcoreApp } from '~/framework/util/moduleTool';

/**
 * gonna allow us to display again modal if we made updates or wana show it again
 */
const ONBOARDING_VERSION = 'v1';
let hasAutoShownOnboardingThisSession = false;

export function useMyAppsHomeController() {
  const navigation = useNavigation() as any;
  const dispatch = useDispatch<AppDispatch>();

  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const modalRef = React.useRef<ModalBoxHandle>(null);
  const pendingToastRef = React.useRef<null | { type: 'success' | 'error'; message: string }>(null);
  const pendingToggleRef = React.useRef<string | null>(null);
  const appsListRef = React.useRef<FlashList<MyAppsListItem>>(null);

  const [filter, setFilter] = React.useState<MyAppsFilter>({ type: 'category', value: 'toutes' });
  const [onboardingSeen, setOnboardingSeen] = React.useState(0);
  const [selectedApp, setSelectedApp] = React.useState<AppsInfoAggregated | null>(null);
  const [bottomSheetMode, setBottomSheetMode] = React.useState<'home_menu' | 'app_actions'>('home_menu');
  const [refreshing, setRefreshing] = React.useState<boolean>(false);

  const areAppsShowed = useSelector(getAllappsShowedState);
  const aggregatedApps = useSelector(selectAggregatedApps);
  const apps = useFilteredApps(filter);
  const isAllAppsTab = filter.type === 'category' && filter.value === 'toutes';

  const queueToast = React.useCallback((type: 'success' | 'error', message: string) => {
    pendingToastRef.current = { message, type };
  }, []);

  const displayToast = React.useCallback(() => {
    const t = pendingToastRef.current;
    if (!t) return;

    pendingToastRef.current = null;

    t.type === 'success' ? Toast.showSuccess(t.message) : Toast.showError(t.message);
  }, []);

  const hasSeenOnboarding = React.useMemo(() => {
    const onboarding = readMyAppsOnboarding();
    return Boolean(onboarding?.seen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingSeen]);

  useFocusEffect(
    React.useCallback(() => {
      setOnboardingSeen(t => t + 1);

      const onboarding = readMyAppsOnboarding();
      const shouldShow =
        onboarding?.seen !== true && onboarding?.version !== ONBOARDING_VERSION && !hasAutoShownOnboardingThisSession;

      if (shouldShow) {
        hasAutoShownOnboardingThisSession = true;
        requestAnimationFrame(() => modalRef.current?.doShowModal());
      }
    }, []),
  );

  const openBottomSheet = React.useCallback(
    (mode: BottomSheetMode, app?: AppsInfoAggregated) => {
      setSelectedApp(app ?? null);
      setBottomSheetMode(mode);
      navigation.setParams({ tabBarVisible: false });
      bottomSheetRef.current?.present();
    },
    [navigation],
  );

  const closeBottomSheet = React.useCallback(() => {
    setSelectedApp(null);
    navigation.setParams({ tabBarVisible: true });
    bottomSheetRef.current?.dismiss();
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
    (appName: string) => {
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
    dispatch(toggleAllApps());
  }, [dispatch]);

  const completeOnboarding = React.useCallback(() => {
    writeMyAppsOnboardingSeen(ONBOARDING_VERSION);
    setOnboardingSeen(t => t + 1);
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
    aggregatedApps,
    apps,
    appsListRef,
    areAppsShowed,
    bottomSheetMode,
    bottomSheetRef,
    closeBottomSheet,
    completeOnboarding,
    filter,
    handleDismiss,
    hasSeenOnboarding,
    isAllAppsTab,
    modalRef,
    navigateToFavorites: () => navigation.navigate(ModalsRouteNames.FavoritesManagement),
    onboardingSeen,
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
