import * as React from 'react';
import { View } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { styles } from './styles';
import { BottomSheetMode, MyAppsHomeScreenProps } from './types';
import { EMPTY_SCREEN_CONFIG, openHelpLink, resolveEmptyScreenKey } from './utils';

import { I18n } from '~/app/i18n';
import { AppDispatch, getStore } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { Svg } from '~/framework/components/picture';
import { Toggle } from '~/framework/components/toggle';
import { MyAppsFilters } from '~/framework/modules/myAppMenu/components/my-apps-filters';
import { MyAppsList } from '~/framework/modules/myAppMenu/components/my-apps-list';
import { MyAppsMenuItem } from '~/framework/modules/myAppMenu/components/my-apps-menu-item';
import { MAOSProps, MyAppsOnboardingModal } from '~/framework/modules/myAppMenu/components/my-apps-onboarding-modal';
import {
  appInfoActions,
  getAllappsShowedState,
  selectFilteredAppsWithMobile,
  toggleFavorite,
} from '~/framework/modules/myapps/reducer';
import { AppsInfoAggregated, MyAppsFilter } from '~/framework/modules/myapps/types';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarTitle } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';

const MyAppsHomeScreen = (props: MyAppsHomeScreenProps) => {
  const appStore = getStore();
  const dispatch = appStore.dispatch as AppDispatch;
  const navigation = useNavigation() as any;
  const getLang = I18n.get;
  const [apps, setApps] = React.useState<AppsInfoAggregated[]>([]);
  const filterInitialState: React.SetStateAction<MyAppsFilter> = { type: 'category', value: 'toutes' };
  const [filter, setFilter] = React.useState<MyAppsFilter>(filterInitialState);
  const areAppsShowed = getAllappsShowedState(appStore.getState());
  const [bottomSheetMode, setBottomSheetMode] = React.useState<BottomSheetMode>('home_menu');
  const [selectedApp, setSelectedApp] = React.useState<AppsInfoAggregated | null>(null);
  const isFavoritesTab = filter.type === 'favorites';

  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const modalRef = React.useRef<ModalBoxHandle>(null);

  const openBottomSheet = (mode: BottomSheetMode, app?: AppsInfoAggregated) => {
    setSelectedApp(app ?? null);
    setBottomSheetMode(mode);
    bottomSheetModalRef.current?.present();
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setFilter(filterInitialState);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const onPresentBottomSheet = React.useCallback(() => {
    openBottomSheet('home_menu');
  }, []);

  const onDismissBottomSheet = () => {
    setSelectedApp(null);
    bottomSheetModalRef.current?.dismiss();
  };

  const handleToggleFavorite = React.useCallback(
    (appName: string) => {
      dispatch(toggleFavorite(appName));
      onDismissBottomSheet();
    },
    [dispatch],
  );
  const renderMenuIcon = React.useCallback(
    (name: string) => (
      <Svg name={name} width={UI_SIZES.spacing.big} height={UI_SIZES.spacing.big} fill={theme.palette.grey.black} />
    ),
    [],
  );

  const renderBottomSheetContent = React.useCallback(() => {
    switch (bottomSheetMode) {
      case 'home_menu':
        return (
          <React.Fragment>
            <MyAppsMenuItem
              onPress={() => {
                onDismissBottomSheet();
                setTimeout(() => {
                  navigation.navigate(ModalsRouteNames.FavoritesManagement);
                }, 300);
              }}
              leftElement={renderMenuIcon('ui-star-outline')}
              label={getLang('myapp-bottomsheet-handle-favorites')}
            />
            {filter.type !== 'favorites' && (
              <React.Fragment>
                <View style={styles.separatorLine} />
                <MyAppsMenuItem
                  isPressable={false}
                  leftElement={
                    <Toggle
                      checked={areAppsShowed}
                      onChange={_ => {
                        dispatch(appInfoActions.toggleAllApps());
                      }}
                    />
                  }
                  label={getLang('myapp-bottomsheet-render-all-favorites')}
                />
                <MyAppsMenuItem
                  isPressable={false}
                  leftElement={renderMenuIcon('ui-infoCircle')}
                  label={getLang('myapp-bottomsheet-info-message')}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        );

      case 'app_actions':
        if (!selectedApp) return null;
        return (
          <>
            <MyAppsMenuItem
              label={
                selectedApp.isFavorite
                  ? getLang('myapp-bottomsheet-withdraw-from-favorites')
                  : getLang('myapp-bottomsheet-add-to-favorites')
              }
              leftElement={renderMenuIcon('ui-star-outline')}
              onPress={() => handleToggleFavorite(selectedApp.name)}
            />
            <View style={styles.separatorLine} />
            <MyAppsMenuItem
              leftElement={renderMenuIcon('ui-infoCircle')}
              label={getLang('myapp-bottomsheet-app-info')}
              onPress={() => {
                onDismissBottomSheet();
                openHelpLink(selectedApp?.help);
              }}
            />
          </>
        );
    }
  }, [
    areAppsShowed,
    bottomSheetMode,
    dispatch,
    filter.type,
    getLang,
    handleToggleFavorite,
    navigation,
    renderMenuIcon,
    selectedApp,
  ]);

  const renderBottomSheet = React.useCallback(() => {
    return (
      <BottomSheetModal
        closeButton
        ref={bottomSheetModalRef}
        onDismiss={onDismissBottomSheet}
        enableDynamicSizing
        containerStyle={styles.bottomSheetContainer}>
        {renderBottomSheetContent()}
      </BottomSheetModal>
    );
  }, [renderBottomSheetContent]);

  const slides: MAOSProps[] = [
    {
      description: I18n.get('myapp-onboarding-favorites-description'),
      illustration: {
        name: 'ui-myapps-list',
        type: 'svg',
      },
      key: 'favorites',
      title: I18n.get('myapp-onboarding-favorites-title'),
    },
    {
      description: I18n.get('myapp-onboarding-lonpress-description'),
      illustration: {
        source: require('ASSETS/animations/myapps/myapps-more-actions.json'),
        type: 'animated',
      },
      key: 'filter-gif',
      title: I18n.get('myapp-onboarding-longpress-title'),
    },
    {
      description: I18n.get('myapp-onboarding-favorite-add-description'),
      illustration: {
        name: 'ui-make-favorite',
        type: 'svg',
      },
      key: 'make-favorite',
      title: I18n.get('myapp-onboarding-favorite-add-title'),
    },
  ];

  React.useEffect(() => {
    const store = getStore();

    const updateApps = () => {
      const state = store.getState();
      const aggregatedApps = selectFilteredAppsWithMobile(state, filter, areAppsShowed);
      setApps(aggregatedApps);
    };

    updateApps();
    const unsubscribe = store.subscribe(updateApps);
    return unsubscribe;
  }, [filter, areAppsShowed]);

  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <NavBarActionsGroup
          elements={[
            <NavBarAction icon="ui-notif-empty" onPress={() => modalRef.current?.doShowModal()} />,
            <NavBarAction disabled={false} icon="ui-options" onPress={onPresentBottomSheet} />,
          ]}
        />
      ),
      headerTitle: navBarTitle(getLang('myapp-appname')),
    });
  }, [onPresentBottomSheet, props.navigation, getLang]);

  return (
    <PageView>
      <MyAppsFilters selectedFilter={filter} onFilterChange={setFilter} />
      <MyAppsList
        apps={apps}
        emptyScreenConfig={EMPTY_SCREEN_CONFIG[resolveEmptyScreenKey(filter)]}
        isFavoritesFilter={isFavoritesTab}
        onPressApp={app => {
          if (app.routeName) {
            props.navigation.navigate(app.routeName);
          } else {
            openUrl(app.address);
          }
        }}
        onLongPressApp={app => openBottomSheet('app_actions', app)}
      />
      {renderBottomSheet()}
      <MyAppsOnboardingModal
        ref={modalRef}
        slides={slides}
        onComplete={() => {}}
        onDismiss={() => modalRef.current?.doDismissModal()}
      />
    </PageView>
  );
};

export default MyAppsHomeScreen;
