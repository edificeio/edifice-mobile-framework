import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import { headerAction, screenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import CustomBottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { Svg, SvgProps } from '~/framework/components/picture';
import { Toggle } from '~/framework/components/toggle';
import { MAOSProps, MyAppsFilters, MyAppsList, MyAppsMenuItem, MyAppsOnboardingModal } from '~/framework/modules/myapps/components';
import { AppsInfoAggregated } from '~/framework/modules/myapps/types';
import Feedback from '~/framework/util/feedback/feedback';
import { Loading } from '~/ui/Loading';

import { styles } from './styles';
import { MyAppsHomeScreenProps } from './types';
import { useMyAppsHomeController } from './useController';
import { EMPTY_SCREEN_CONFIG, hasHelpLink, openHelpLink, resolveEmptyScreenKey } from './utils';

export const computeNavBar = screenOptions(() => ({
  title: I18n.get('myapp-appname'),
}));

const MyAppsHomeScreen = ({ navigation }: MyAppsHomeScreenProps) => {
  const {
    apps,
    appsListRef,
    areAppsShowed,
    bottomSheetMode,
    closeBottomSheet,
    completeOnboarding,
    filter,
    handleDismiss,
    handleOpenOnboarding,
    hasFetchError,
    hasSeenOnboarding,
    isAggregatedAppsEmpty,
    isAllAppsTab,
    isBottomSheetVisible,
    isFavoritesFilter,
    modalRef,
    navigateToFavorites,
    onPressApp,
    onRefresh,
    onToggleAllApps,
    onToggleFavorite,
    openBottomSheet,
    refreshing,
    selectedApp,
    setFilter,
  } = useMyAppsHomeController();

  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);

  React.useEffect(() => {
    if (isBottomSheetVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isBottomSheetVisible, navigation]);

  const slides: MAOSProps[] = [
    {
      description: I18n.get('myapp-onboarding-favorites-description'),
      illustration: { name: 'ui-myapps-list', type: 'svg' },
      key: 'applist',
      subtitle: I18n.get('myapp-onboarding-favorites-subtitle'),
      title: I18n.get('myapp-onboarding-favorites-title'),
    },
    {
      description: I18n.get('myapp-onboarding-lonpress-description'),
      illustration: {
        source: require('ASSETS/animations/myapps/myapps-more-actions.json'),
        type: 'animated',
      },
      key: 'longpress',
      subtitle: I18n.get('myapp-onboarding-longpress-subtitle'),
      title: I18n.get('myapp-onboarding-longpress-title'),
    },
    {
      description: I18n.get('myapp-onboarding-favorite-add-description'),
      illustration: { name: 'ui-make-favorite', type: 'svg' },
      key: 'add-favorite',
      subtitle: I18n.get('myapp-onboarding-favorite-add-subtitle'),
      title: I18n.get('myapp-onboarding-favorite-add-title'),
    },
  ];

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: props => (
        <>
          {
            headerAction(
              {
                disabled: isAggregatedAppsEmpty,
                icon: hasSeenOnboarding ? 'ui-notif-empty' : 'ui-notif',
                onPress: handleOpenOnboarding,
                testID: hasSeenOnboarding ? 'myapps-navbar-notif-empty' : 'myapps-navbar-notif',
              },
              props,
            ).element
          }
          {
            headerAction(
              {
                disabled: isAggregatedAppsEmpty,
                icon: 'ui-options',
                onPress: () => openBottomSheet('home_menu'),
                testID: 'myapps-navbar-context-menu',
              },
              props,
            ).element
          }
        </>
      ),
      unstable_headerRightItems: props => [
        headerAction(
          {
            disabled: isAggregatedAppsEmpty,
            icon: hasSeenOnboarding ? 'ui-notif-empty' : 'ui-notif',
            onPress: handleOpenOnboarding,
            testID: hasSeenOnboarding ? 'myapps-navbar-notif-empty' : 'myapps-navbar-notif',
          },
          props,
        ),
        headerAction(
          {
            disabled: isAggregatedAppsEmpty,
            icon: 'ui-options',
            onPress: () => openBottomSheet('home_menu'),
            testID: 'myapps-navbar-context-menu',
          },
          props,
        ),
      ],
    });
  }, [handleOpenOnboarding, hasSeenOnboarding, isAggregatedAppsEmpty, navigation, openBottomSheet]);

  const renderMenuIcon = React.useCallback(
    (name: SvgProps['name']) => (
      <Svg name={name} width={UI_SIZES.spacing.big} height={UI_SIZES.spacing.big} fill={theme.palette.grey.black} />
    ),
    [],
  );

  const handleToggleFavorite = React.useCallback(() => {
    closeBottomSheet();
    setTimeout(() => navigateToFavorites(), 300);
  }, [closeBottomSheet, navigateToFavorites]);

  const onAppInfoPress = React.useCallback(() => {
    closeBottomSheet();
    openHelpLink(selectedApp?.help);
  }, [closeBottomSheet, selectedApp]);

  const renderBottomSheetContent = React.useCallback(() => {
    switch (bottomSheetMode) {
      case 'home_menu':
        return (
          <React.Fragment>
            <MyAppsMenuItem
              onPress={handleToggleFavorite}
              leftElement={renderMenuIcon('ui-star-outline')}
              label={I18n.get('myapp-bottomsheet-handle-favorites')}
              testID="myapps-menu-manage-favorites"
            />

            {!isFavoritesFilter && (
              <React.Fragment>
                <View style={styles.separatorLine} />
                <MyAppsMenuItem
                  isPressable={false}
                  leftElement={
                    <Toggle
                      checked={areAppsShowed}
                      onChange={onToggleAllApps}
                      testID={areAppsShowed ? 'myapps-all-showed' : 'myapps-all-hidden'}
                    />
                  }
                  label={I18n.get('myapp-bottomsheet-render-all-favorites')}
                />
                <MyAppsMenuItem
                  isPressable={false}
                  leftElement={renderMenuIcon('ui-infoCircle')}
                  label={I18n.get('myapp-bottomsheet-info-message')}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        );

      case 'app_actions':
        if (!selectedApp) return null;

        return (
          <React.Fragment>
            <MyAppsMenuItem
              label={
                selectedApp.isFavorite
                  ? I18n.get('myapp-bottomsheet-withdraw-from-favorites')
                  : I18n.get('myapp-bottomsheet-add-to-favorites')
              }
              leftElement={renderMenuIcon(selectedApp.isFavorite ? 'ui-star-filled' : 'ui-star-outline')}
              onPress={onToggleFavorite(selectedApp.name)}
              testID="myapps-toggle-favorite"
            />

            {hasHelpLink(selectedApp?.help) && (
              <React.Fragment>
                <View style={styles.separatorLine} />
                <MyAppsMenuItem
                  label={I18n.get('myapp-bottomsheet-app-info')}
                  leftElement={renderMenuIcon('ui-infoCircle')}
                  onPress={onAppInfoPress}
                  testID="myapps-app-info"
                />
              </React.Fragment>
            )}
          </React.Fragment>
        );
    }
  }, [
    areAppsShowed,
    bottomSheetMode,
    handleToggleFavorite,
    isFavoritesFilter,
    onAppInfoPress,
    onToggleAllApps,
    onToggleFavorite,
    renderMenuIcon,
    selectedApp,
  ]);

  const handleDismissBottomSheet = React.useCallback(() => {
    closeBottomSheet();
    handleDismiss();
  }, [closeBottomSheet, handleDismiss]);

  const renderBottomSheet = React.useCallback(
    () => (
      <CustomBottomSheetModal
        handleIndicatorStyle={styles.bottomSheetHandle}
        ref={bottomSheetRef}
        closeButton
        gutters={false}
        onDismiss={handleDismissBottomSheet}>
        <View style={styles.bottomSheetContainer}>{renderBottomSheetContent()}</View>
      </CustomBottomSheetModal>
    ),
    [handleDismissBottomSheet, renderBottomSheetContent],
  );

  const renderEmptyScreen = React.useCallback(
    () => (
      <View style={styles.emptyScreen}>
        <EmptyScreen
          title={I18n.get('myapp-empty-screen-home-title')}
          text={I18n.get('myapp-empty-screen-home-text')}
          svgImage="empty-content"
          {...(hasFetchError && {
            buttonAction: onRefresh,
            buttonIcon: 'ui-refresh',
            buttonText: I18n.get('myapp-retry'),
          })}
          testID="myapps-empty-screen"
        />
      </View>
    ),
    [hasFetchError, onRefresh],
  );

  const onCardLongPress = React.useCallback(
    (app: AppsInfoAggregated) => {
      Feedback.longPress();
      openBottomSheet('app_actions', app);
    },
    [openBottomSheet],
  );

  const renderMainContent = React.useMemo(() => {
    if (isAggregatedAppsEmpty && refreshing) return <Loading />;
    if (isAggregatedAppsEmpty) return renderEmptyScreen();

    return (
      <MyAppsList
        ref={appsListRef}
        apps={apps}
        emptyScreenConfig={EMPTY_SCREEN_CONFIG[resolveEmptyScreenKey(filter)]}
        isAllAppsFilter={isAllAppsTab}
        onPressApp={onPressApp}
        onRefresh={onRefresh}
        onLongPressApp={onCardLongPress}
        refreshing={refreshing}
      />
    );
  }, [
    isAggregatedAppsEmpty,
    refreshing,
    renderEmptyScreen,
    appsListRef,
    apps,
    filter,
    isAllAppsTab,
    onPressApp,
    onRefresh,
    onCardLongPress,
  ]);

  return (
    <PageView>
      {!isAggregatedAppsEmpty && <MyAppsFilters selectedFilter={filter} onFilterChange={setFilter} />}
      {renderMainContent}
      {!isAggregatedAppsEmpty && <MyAppsOnboardingModal ref={modalRef} slides={slides} onComplete={completeOnboarding} />}
      {renderBottomSheet()}
    </PageView>
  );
};

export default MyAppsHomeScreen;
