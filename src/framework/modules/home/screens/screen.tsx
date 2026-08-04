import React from 'react';
import { View } from 'react-native';

import { TabView } from 'react-native-tab-view';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import { NavBarProfileButton } from '~/framework/components/navigation';
import ScrollView from '~/framework/components/scrollView';
import { BodyBoldText, CaptionText } from '~/framework/components/text';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { withSession } from '~/framework/modules/auth/util';
import { HomeTabRoute, HomeTopTabBar, HomeTopTabBarProps } from '~/framework/modules/home/components';
import { accountTypeInfos } from '~/framework/util/accountType';

import { styles } from './styles';
import { HomeScreenProps } from './types';

export const HomeScreenOptions = screenOptions(({ navigation }) => ({
  // the navbar line is inherited from `defaultScreenOptions`.
  // override it here the day the home
  // needs its own, once Design provides the SVG:
  // headerBackground: () => <Svg name={dynamicName} />,
  headerLeft: () => <NavBarProfileButton onPress={() => navigation.navigate('user')} />,
  headerShadowVisible: false,
  headerStyle: styles.headerStyle,
  headerTintColor: theme.palette.grey.black.toString(),
  headerTitle: HomeScreenNavBarTitle,
  unstable_headerLeftItems: () => [
    {
      element: <NavBarProfileButton onPress={() => navigation.navigate('user')} />,
      type: 'custom',
    },
  ],
}));

export const HomeScreenNavBarTitle = function () {
  const session = useSelector(selectors.session);
  const accountType = session?.user.type;

  return (
    <View style={styles.navBarTitle}>
      <BodyBoldText numberOfLines={1}>{session?.user.displayName}</BodyBoldText>
      {accountType ? <CaptionText numberOfLines={1}>{accountTypeInfos[accountType].text}</CaptionText> : null}
    </View>
  );
};

const HomeTabScene = ({ route }: { route: HomeTabRoute }) => (
  <ScrollView contentContainerStyle={styles.scene}>
    <CaptionText>{I18n.get(route.title)}</CaptionText>
  </ScrollView>
);

const renderTabBar = (props: HomeTopTabBarProps) => <HomeTopTabBar {...props} />;

const renderScene = ({ route }: { route: HomeTabRoute }) => <HomeTabScene route={route} />;

export const HomeScreen = withSession(function ({}: HomeScreenProps) {
  const [index, setIndex] = React.useState<number>(0);

  // ToDo: get the unread count of the news feed from the store.
  const routes = React.useMemo<HomeTabRoute[]>(
    () => [
      { key: 'home', title: 'home-tab-home' },
      { badge: 2, key: 'news', title: 'home-tab-news' },
    ],
    [],
  );
  const navigationState = React.useMemo(() => ({ index, routes }), [index, routes]);

  return (
    <View style={styles.page}>
      <TabView navigationState={navigationState} onIndexChange={setIndex} renderScene={renderScene} renderTabBar={renderTabBar} />
    </View>
  );
});
