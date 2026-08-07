import * as React from 'react';
import { View } from 'react-native';

import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import { BarLine, NavBarProfileButton } from '~/framework/components/navigation';
import ScrollView from '~/framework/components/scrollView';
import { BodyBoldText, CaptionText } from '~/framework/components/text';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { withSession } from '~/framework/modules/auth/util';
import { HomeTopTabBar, HomeTopTabBarProps } from '~/framework/modules/home/components';
import { accountTypeInfos } from '~/framework/util/accountType';

import { styles } from './styles';
import { HomeScreenProps, HomeTabsParamList } from './types';

export const HomeScreenOptions = screenOptions(({ navigation }) => {
  const profileButton = <NavBarProfileButton onPress={() => navigation.navigate('user')} />;

  return {
    // background has to be painted here. colors still come from `theme.ui.navigation.navBar`.
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

// todo: replace by the real tab contents.
const HomeTabPlaceholder = ({ i18nKey }: { i18nKey: string }) => (
  <ScrollView contentContainerStyle={styles.scene}>
    <CaptionText>{I18n.get(i18nKey)}</CaptionText>
  </ScrollView>
);

const HomeOverviewTab = () => <HomeTabPlaceholder i18nKey="home-overview-title" />;

const HomeNotificationsTab = () => <HomeTabPlaceholder i18nKey="home-notifications-title" />;

const overviewOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-overview',
  title: I18n.get('home-overview-title'),
});

const notificationsOptions = (): MaterialTopTabNavigationOptions => ({
  // ToDo: get the unread count of the notifications from the store.
  tabBarBadge: () => <Badge content={2} color={theme.palette.status.failure.regular} />,
  tabBarButtonTestID: 'home-tab-notifications',
  title: I18n.get('home-notifications-title'),
});

const renderTabBar = (props: HomeTopTabBarProps) => <HomeTopTabBar {...props} />;

const HomeTabs = createMaterialTopTabNavigator<HomeTabsParamList>();

export const HomeScreen = withSession(function ({}: HomeScreenProps) {
  return (
    <HomeTabs.Navigator style={styles.page} tabBar={renderTabBar}>
      <HomeTabs.Screen name="home/overview" component={HomeOverviewTab} options={overviewOptions} />
      <HomeTabs.Screen name="home/notifications" component={HomeNotificationsTab} options={notificationsOptions} />
    </HomeTabs.Navigator>
  );
});
