import React from 'react';
import { View } from 'react-native';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NativeStackHeaderItem } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { headerAction, screenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import PopupMenu from '~/framework/components/menus/popup';
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

import { styles } from './styles';
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

  React.useEffect(() => {
    if (!workflows.length) return;

    const createButton = (props: Parameters<typeof headerAction>[1]) =>
      headerAction(
        { icon: 'ui-plus', testID: 'home-add-button' },
        { ...props, tintColor: theme.palette.secondary.dark.toString() },
      );

    navigation.setOptions({
      headerRight: props => <PopupMenu actions={workflows}>{createButton(props).element}</PopupMenu>,
      unstable_headerRightItems: props => {
        const action = createButton(props);
        return [{ ...action, element: <PopupMenu actions={workflows}>{action.element}</PopupMenu> }] as NativeStackHeaderItem[];
      },
    });
  }, [navigation, workflows]);

  return (
    <HomeReloadProvider value={reloadKey}>
      <HomeTabs.Navigator style={styles.page} tabBar={renderTabBar}>
        <HomeTabs.Screen name="home/overview" component={HomeOverviewScreen} options={HomeOverviewScreenOptions} />
        <HomeTabs.Screen name="home/notifications" component={HomeNotificationsScreen} options={HomeNotificationsScreenOptions} />
      </HomeTabs.Navigator>
    </HomeReloadProvider>
  );
});
