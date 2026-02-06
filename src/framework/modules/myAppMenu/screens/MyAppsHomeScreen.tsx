import * as React from 'react';
import { View } from 'react-native';

import { styles } from './styles';
import { MyAppsHomeScreenProps } from './types';
import { useMyAppsHomeController } from './useController';
import { EMPTY_SCREEN_CONFIG, openHelpLink, resolveEmptyScreenKey } from './utils';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import BottomSheetModal from '~/framework/components/modals/bottom-sheet';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { Svg } from '~/framework/components/picture';
import { Toggle } from '~/framework/components/toggle';
import {
  MAOSProps,
  MyAppsFilters,
  MyAppsList,
  MyAppsMenuItem,
  MyAppsOnboardingModal,
} from '~/framework/modules/myAppMenu/components';
import { AppsInfoAggregated } from '~/framework/modules/myapps/types';
import { navBarTitle } from '~/framework/navigation/navBar';

const MyAppsHomeScreen = ({ navigation }: MyAppsHomeScreenProps) => {
  const getLang = I18n.get;

  const {
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
    navigateToFavorites,
    onPressApp,
    onToggleAllApps,
    onToggleFavorite,
    openBottomSheet,
    selectedApp,
    setFilter,
  } = useMyAppsHomeController();

  const slides: MAOSProps[] = [
    {
      description: getLang('myapp-onboarding-favorites-description'),
      illustration: { name: 'ui-myapps-list', type: 'svg' },
      key: 'applist',
      subtitle: getLang('myapp-onboarding-favorites-subtitle'),
      title: getLang('myapp-onboarding-favorites-title'),
    },
    {
      description: getLang('myapp-onboarding-lonpress-description'),
      illustration: {
        source: require('ASSETS/animations/myapps/myapps-more-actions.json'),
        type: 'animated',
      },
      key: 'longpress',
      subtitle: getLang('myapp-onboarding-longpress-subtitle'),
      title: getLang('myapp-onboarding-longpress-title'),
    },
    {
      description: getLang('myapp-onboarding-favorite-add-description'),
      illustration: { name: 'ui-make-favorite', type: 'svg' },
      key: 'add-favorite',
      subtitle: getLang('myapp-onboarding-favorite-add-subtitle'),
      title: getLang('myapp-onboarding-favorite-add-title'),
    },
  ];

  const renderHeaderRight = React.useCallback(
    () => (
      <NavBarActionsGroup
        elements={[
          <NavBarAction
            key="notif"
            icon={hasSeenOnboarding ? 'ui-notif-empty' : 'ui-notif'}
            onPress={() => modalRef.current?.doShowModal()}
          />,
          <NavBarAction key="options" icon="ui-options" onPress={() => openBottomSheet('home_menu')} />,
        ]}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasSeenOnboarding, openBottomSheet],
  );

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: renderHeaderRight,
      headerTitle: navBarTitle(getLang('myapp-appname')),
    });
  }, [navigation, renderHeaderRight, getLang]);

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
                closeBottomSheet();
                setTimeout(() => navigateToFavorites(), 300);
              }}
              leftElement={renderMenuIcon('ui-star-outline')}
              label={getLang('myapp-bottomsheet-handle-favorites')}
            />

            {filter.type !== 'favorites' && (
              <React.Fragment>
                <View style={styles.separatorLine} />

                <MyAppsMenuItem
                  isPressable={false}
                  leftElement={<Toggle checked={areAppsShowed} onChange={onToggleAllApps} />}
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
              onPress={() => onToggleFavorite(selectedApp.name)}
            />

            <View style={styles.separatorLine} />

            <MyAppsMenuItem
              leftElement={renderMenuIcon('ui-infoCircle')}
              label={getLang('myapp-bottomsheet-app-info')}
              onPress={() => {
                closeBottomSheet();
                openHelpLink(selectedApp.help);
              }}
            />
          </>
        );
    }
  }, [
    areAppsShowed,
    bottomSheetMode,
    closeBottomSheet,
    filter.type,
    getLang,
    navigateToFavorites,
    onToggleAllApps,
    onToggleFavorite,
    renderMenuIcon,
    selectedApp,
  ]);

  const renderBottomSheet = React.useCallback(
    () => (
      <BottomSheetModal
        closeButton
        ref={bottomSheetRef}
        onDismiss={closeBottomSheet}
        enableDynamicSizing
        containerStyle={styles.bottomSheetContainer}>
        {renderBottomSheetContent()}
      </BottomSheetModal>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [closeBottomSheet, renderBottomSheetContent],
  );

  return (
    <PageView>
      <MyAppsFilters selectedFilter={filter} onFilterChange={setFilter} />
      <MyAppsList
        apps={apps}
        emptyScreenConfig={EMPTY_SCREEN_CONFIG[resolveEmptyScreenKey(filter)]}
        isAllAppsFilter={isAllAppsTab}
        onPressApp={onPressApp}
        onLongPressApp={(app: AppsInfoAggregated) => openBottomSheet('app_actions', app)}
      />
      {renderBottomSheet()}
      <MyAppsOnboardingModal ref={modalRef} slides={slides} onComplete={completeOnboarding} />
    </PageView>
  );
};

export default MyAppsHomeScreen;
