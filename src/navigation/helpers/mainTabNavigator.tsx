import styled from '@emotion/native';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationScreenProp, NavigationState } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { connect } from 'react-redux';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { IconProps, Picture, PictureProps } from '~/framework/components/picture';
import { IconOnOff } from '~/ui/icons/IconOnOff';
import { getIsXmasActive } from '~/user/actions/xmas';

const TabBarText = styled.Text({
  alignSelf: 'center',
  fontSize: UI_SIZES.screen.height < UI_SIZES.standardScreen.height ? 10 : 12,
  paddingBottom: UI_SIZES.screen.bottomInset ? 0 : 4,
  lineHeight: UI_SIZES.screen.bottomInset ? 14 : 16,
});

const MainTabNavigationLabel = props => (
  <TabBarText numberOfLines={1} style={{ color: props.focused ? theme.palette.primary.regular : theme.ui.text.light }}>
    {props.children}
  </TabBarText>
);

export const shouldTabBarBeVisible = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
  return {
    tabBarVisible: !(navigation.state.index > 0),
  };
};

export const createMainTabNavigator = (routeConfigs, initialRouteName: string = '') =>
  createBottomTabNavigator(routeConfigs, {
    initialRouteName,
    defaultNavigationOptions: shouldTabBarBeVisible,
    swipeEnabled: false,
    tabBarOptions: {
      // Colors
      activeTintColor: theme.palette.primary.regular,
      inactiveTintColor: theme.palette.primary.regular,
      // Insets
      safeAreaInset: {
        bottom: UI_SIZES.screen.bottomInset,
        top: UI_SIZES.screen.topInset,
      },
      // Label and icon
      showIcon: true,
      showLabel: true,
      // Style
      style: {
        backgroundColor: theme.ui.background.card,
        borderTopColor: theme.palette.grey.cloudy,
        borderTopWidth: 1,
        elevation: 1,
        height: UI_SIZES.elements.tabbarHeight,
      },
      tabStyle: {
        flexDirection: 'column',
        height: '100%',
        paddingTop: UI_SIZES.screen.bottomInset ? UI_SIZES.spacing.minor : UI_SIZES.spacing.tiny,
      },
    },
  });

const IconOnOffWithXmas = connect((state: IGlobalState) => ({
  isXmas: getIsXmasActive(state),
}))((props: IconProps & { isXmas?: boolean; focused: boolean }) => {
  const { name, isXmas, ...other } = props;
  return <IconOnOff {...other} name={isXmas ? `xmas-${name}` : (name as string)} />;
});

const IconPictureWithXmas = connect((state: IGlobalState) => ({
  isXmas: getIsXmasActive(state),
}))((props: PictureProps & IconProps & { isXmas?: boolean; focused: boolean }) => {
  const { name, isXmas, ...other } = props;
  return <Picture {...other} name={isXmas ? `xmas-${name}` : (name as string)} />;
});

// ToDo : remove magic values here, replace with RN6
export const createMainTabNavOption = (title: string, icon?: string | PictureProps, iconFocus?: PictureProps) => {
  const computePicture = (icn: PictureProps) => {
    if (icn.type === 'NamedSvg') {
      icn.height = UI_SIZES.elements.tabbarIconSize;
      icn.width = UI_SIZES.elements.tabbarIconSize;
      // icon.style = { marginBottom: UI_SIZES.spacing.small };
    } else if (icn.type === 'Image') {
      icn.style = {
        height: UI_SIZES.elements.tabbarIconSize,
        // marginBottom: UI_SIZES.spacing.small,
        width: UI_SIZES.elements.tabbarIconSize,
      };
    } else if (icn.type === 'Icon') {
      icn.size = UI_SIZES.elements.tabbarIconSize;
      // icon.style = { marginBottom: UI_SIZES.spacing.small };
    }
    return icn;
  };
  if (!icon) {
    return {
      tabBarIcon: ({ focused }) => <View />,
      tabBarLabel: ({ focused }) => <MainTabNavigationLabel focused={focused}>{title}</MainTabNavigationLabel>,
    };
  } else if (typeof icon === 'string') {
    return {
      tabBarIcon: ({ focused }) => (
        <IconOnOffWithXmas
          size={UI_SIZES.elements.tabbarIconSize}
          name={icon as string}
          focused={focused}
          // style={{ marginBottom: UI_SIZES.spacing.small }}
        />
      ), // MO-142 use UI_SIZES.spacing here
      tabBarLabel: ({ focused }) => <MainTabNavigationLabel focused={focused}>{title}</MainTabNavigationLabel>,
    };
  } else {
    icon = computePicture(icon);
    iconFocus = computePicture(iconFocus ?? icon);
    if (icon.type === 'NamedSvg') {
      return {
        tabBarIcon: ({ focused }) => (focused ? <Picture {...iconFocus} /> : <Picture {...icon} />),
        tabBarLabel: ({ focused }) => <MainTabNavigationLabel focused={focused}>{title}</MainTabNavigationLabel>,
      };
    } else if (icon.type === 'Image') {
      icon.style = {
        width: UI_SIZES.elements.tabbarIconSize,
        height: UI_SIZES.elements.tabbarIconSize,
        // marginBottom: UI_SIZES.spacing.small,
      };
      return {
        tabBarIcon: ({ focused }) => (focused ? <Picture {...iconFocus} /> : <Picture {...icon} />),
        tabBarLabel: ({ focused }) => <MainTabNavigationLabel focused={focused}>{title}</MainTabNavigationLabel>,
      };
    } else if (icon.type === 'Icon') {
      return {
        tabBarIcon: ({ focused }) =>
          focused ? (
            <IconPictureWithXmas {...iconFocus} color={theme.palette.primary.regular} />
          ) : (
            <IconPictureWithXmas {...icon} color={theme.ui.text.light} />
          ),
        tabBarLabel: ({ focused }) => <MainTabNavigationLabel focused={focused}>{title}</MainTabNavigationLabel>,
      };
    } else
      return {
        tabBarIcon: ({ focused }) => (focused ? <Picture {...iconFocus} /> : <Picture {...icon} />),
        tabBarLabel: ({ focused }) => <MainTabNavigationLabel focused={focused}>{title}</MainTabNavigationLabel>,
      };
  }
};
