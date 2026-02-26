import * as React from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { BottomSheetMode } from './types';

import { I18n } from '~/app/i18n';
import { AppDispatch, getStore } from '~/app/store';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import Toast from '~/framework/components/toast';
import {
  getAllappsShowedState,
  selectFilteredAppsWithMobile,
  toggleAllApps,
  toggleFavorite,
} from '~/framework/modules/myapps/reducer';
import { readMyAppsOnboarding, writeMyAppsOnboardingSeen } from '~/framework/modules/myapps/storage';
import { AppsInfoAggregated, MyAppsFilter } from '~/framework/modules/myapps/types';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import { openUrl } from '~/framework/util/linking';

/**
 * gonna allow us to display again modal if we made updates or wana show it again
 */
const ONBOARDING_VERSION = 'v1';
let hasAutoShownOnboardingThisSession = false;

export function useMyAppsHomeController() {
  const navigation = useNavigation() as any;
  const store = getStore();
  const dispatch = store.dispatch as AppDispatch;

  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const modalRef = React.useRef<ModalBoxHandle>(null);
  const pendingToastRef = React.useRef<null | { type: 'success' | 'error'; message: string }>(null);
  const pendingToggleRef = React.useRef<string | null>(null);

  const [apps, setApps] = React.useState<AppsInfoAggregated[]>([]);
  const [filter, setFilter] = React.useState<MyAppsFilter>({ type: 'category', value: 'toutes' });
  const [onboardingSeen, setOnboardingSeen] = React.useState(0);
  const [selectedApp, setSelectedApp] = React.useState<AppsInfoAggregated | null>(null);
  const [bottomSheetMode, setBottomSheetMode] = React.useState<'home_menu' | 'app_actions'>('home_menu');
  const [isBottomSheetOpened, setIsBottomSheetOpened] = React.useState<boolean>(false);

  const areAppsShowed = getAllappsShowedState(store.getState());

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

  const openBottomSheet = React.useCallback((mode: BottomSheetMode, app?: AppsInfoAggregated) => {
    setSelectedApp(app ?? null);
    setBottomSheetMode(mode);
    bottomSheetRef.current?.present();
  }, []);

  const closeBottomSheet = React.useCallback(() => {
    setSelectedApp(null);
    bottomSheetRef.current?.dismiss();
  }, []);

  const onPressApp = React.useCallback(
    (app: AppsInfoAggregated) => {
      if (app.routeName) {
        navigation.navigate(app.routeName);
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
  }, [dispatch, displayToast, queueToast]);

  const onToggleAllApps = React.useCallback(() => {
    dispatch(toggleAllApps());
  }, [dispatch]);

  const completeOnboarding = React.useCallback(() => {
    writeMyAppsOnboardingSeen(ONBOARDING_VERSION);
    setOnboardingSeen(t => t + 1);
  }, []);

  React.useEffect(() => {
    const updateApps = () => {
      const state = store.getState();
      setApps(selectFilteredAppsWithMobile(state, filter, areAppsShowed));
    };

    updateApps();
    return store.subscribe(updateApps);
  }, [filter, areAppsShowed, store]);

  React.useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: isBottomSheetOpened ? 'none' : 'flex',
      },
    });
  }, [isBottomSheetOpened, navigation]);

  return {
    apps,
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
    onToggleAllApps,
    onToggleFavorite,
    openBottomSheet,
    selectedApp,
    setFilter,
    setIsBottomSheetOpened,
  };
}
