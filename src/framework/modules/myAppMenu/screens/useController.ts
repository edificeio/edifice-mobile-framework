import * as React from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { BottomSheetMode } from './types';

import { AppDispatch, getStore } from '~/app/store';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
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

export function useMyAppsHomeController() {
  const navigation = useNavigation() as any;
  const store = getStore();
  const dispatch = store.dispatch as AppDispatch;

  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const modalRef = React.useRef<ModalBoxHandle>(null);
  const hasShownOnboardingForThisScreen = React.useRef(false);

  const [apps, setApps] = React.useState<AppsInfoAggregated[]>([]);
  const [filter, setFilter] = React.useState<MyAppsFilter>({ type: 'category', value: 'toutes' });
  const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<AppsInfoAggregated | null>(null);
  const [bottomSheetMode, setBottomSheetMode] = React.useState<'home_menu' | 'app_actions'>('home_menu');

  const areAppsShowed = getAllappsShowedState(store.getState());
  const isAllAppsTab = filter.type === 'category' && filter.value === 'toutes';

  useFocusEffect(
    React.useCallback(() => {
      const onboarding = readMyAppsOnboarding();
      setHasSeenOnboarding(Boolean(onboarding?.seen));

      if (onboarding?.version !== ONBOARDING_VERSION && !hasShownOnboardingForThisScreen.current) {
        hasShownOnboardingForThisScreen.current = true;
        modalRef.current?.doShowModal();
      }
    }, []),
  );

  // we make sure the onboarding modal is shwon only when wnated
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      hasShownOnboardingForThisScreen.current = false;
    });

    return unsubscribe;
  }, [navigation]);

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
      dispatch(toggleFavorite(appName));
      closeBottomSheet();
    },
    [dispatch, closeBottomSheet],
  );

  const onToggleAllApps = React.useCallback(() => {
    dispatch(toggleAllApps());
  }, [dispatch]);

  const completeOnboarding = React.useCallback(() => {
    writeMyAppsOnboardingSeen(ONBOARDING_VERSION);
    setHasSeenOnboarding(true);
  }, []);

  React.useEffect(() => {
    const updateApps = () => {
      const state = store.getState();
      setApps(selectFilteredAppsWithMobile(state, filter, areAppsShowed));
    };

    updateApps();
    return store.subscribe(updateApps);
  }, [filter, areAppsShowed, store]);

  return {
    apps,
    areAppsShowed,
    bottomSheetMode,
    bottomSheetRef,
    closeBottomSheet,
    completeOnboarding,
    filter,
    hasSeenOnboarding,
    isAllAppsTab,
    modalRef,
    navigateToFavorites: () => navigation.navigate(ModalsRouteNames.FavoritesManagement),
    onPressApp,
    onToggleAllApps,
    onToggleFavorite,
    openBottomSheet,
    selectedApp,
    setFilter,
  };
}
