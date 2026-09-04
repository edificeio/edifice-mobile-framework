import React from 'react';
import { View } from 'react-native';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NativeStackHeaderItem } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { headerAction, screenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Popover } from '~/framework/components/menus/popover';
import { BarLine, NavBarProfileButton } from '~/framework/components/navigation';
import { BodyBoldText, CaptionText } from '~/framework/components/text';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { withSession } from '~/framework/modules/auth/util';
import { TopTabBar, TopTabBarProps } from '~/framework/modules/home/components';
import { HomeReloadProvider, useHomeReloadKey } from '~/framework/modules/home/hooks';
import { HomeNotificationsScreen, HomeNotificationsScreenOptions } from '~/framework/modules/home/screens/notifications';
import { HomeOverviewScreen, HomeOverviewScreenOptions } from '~/framework/modules/home/screens/overview';
import { getTimelineWorkflows } from '~/framework/modules/timeline/timeline-modules';
import { accountTypeInfos } from '~/framework/util/accountType';

import { ADD_BUTTON_SIZE, styles } from './styles';
import { HomeScreenProps, HomeTabsParamList } from './types';

export const HomeScreenOptions = screenOptions(({ navigation }) => {
  const profileButton = <NavBarProfileButton onPress={() => navigation.navigate('user')} />;

  return {
    headerBackground: () => <BarLine bar="navBar" background={theme.ui.navigation.navBar.background} />,
    headerLeft: () => profileButton,
    headerShadowVisible: false,
    headerTitle: HomeScreenNavBarTitle,
    unstable_headerLeftItems: () => [{ element: profileButton, type: 'custom' }],
  };
});

export const HomeScreenNavBarTitle = function () {
  const session = useSelector(selectors.session);
  const accountType = session?.user.type;

  return (
    <View style={styles.navBarTitle}>
      <BodyBoldText numberOfLines={1} style={styles.navBarTitleName}>
        {session?.user.displayName}
      </BodyBoldText>
      {accountType ? (
        <CaptionText numberOfLines={1} style={styles.navBarTitleType}>
          {accountTypeInfos[accountType].text}
        </CaptionText>
      ) : null}
    </View>
  );
};

const renderTabBar = (props: TopTabBarProps) => <TopTabBar {...props} />;

const HomeTabs = createMaterialTopTabNavigator<HomeTabsParamList>();

export const HomeScreen = withSession<HomeScreenProps>(({ navigation, session }) => {
  const reloadKey = useHomeReloadKey();

  const workflows = React.useMemo(
    () => getTimelineWorkflows(session, navigation as unknown as Parameters<typeof getTimelineWorkflows>[1]),
    [navigation, session],
  );

  // Measuring a view held by the native header gives an unstable origin, where the bar tells
  // exactly where its last button sits.
  const addButtonAnchor = React.useMemo(() => {
    const barRightEdge = UI_SIZES.screen.width - UI_SIZES.elements.navbarMargin;
    const barTopEdge = UI_SIZES.screen.topInset;
    const centeredInBar = barTopEdge + (UI_SIZES.elements.navbarHeight - ADD_BUTTON_SIZE) / 2;

    return { height: ADD_BUTTON_SIZE, width: ADD_BUTTON_SIZE, x: barRightEdge - ADD_BUTTON_SIZE, y: centeredInBar };
  }, []);

  React.useEffect(() => {
    if (!workflows.length) return;

    const createButton = (props: Parameters<typeof headerAction>[1]) =>
      headerAction(
        { icon: 'ui-plus', style: styles.addButton, testID: 'home-add-button' },
        { ...props, tintColor: theme.palette.secondary.dark.toString() },
      );

    navigation.setOptions({
      headerRight: props => (
        <Popover actions={workflows} anchor={addButtonAnchor}>
          {createButton(props).element}
        </Popover>
      ),
      unstable_headerRightItems: props => {
        const action = createButton(props);
        return [
          {
            ...action,
            element: (
              <Popover actions={workflows} anchor={addButtonAnchor}>
                {action.element}
              </Popover>
            ),
          },
        ] as NativeStackHeaderItem[];
      },
    });
  }, [addButtonAnchor, navigation, workflows]);

  return (
    <HomeReloadProvider value={reloadKey}>
      <HomeTabs.Navigator style={styles.page} screenOptions={{ sceneStyle: styles.scene }} tabBar={renderTabBar}>
        <HomeTabs.Screen name="home/overview" component={HomeOverviewScreen} options={HomeOverviewScreenOptions} />
        <HomeTabs.Screen name="home/notifications" component={HomeNotificationsScreen} options={HomeNotificationsScreenOptions} />
      </HomeTabs.Navigator>
    </HomeReloadProvider>
  );
});
