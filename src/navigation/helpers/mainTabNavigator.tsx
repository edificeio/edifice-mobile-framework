import styled from '@emotion/native';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationScreenProp, NavigationState } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import theme from '~/app/theme';
import { UI_SIZES, getScaleDimension } from '~/framework/components/constants';
import { Picture, PictureProps } from '~/framework/components/picture';
import { TextSizeStyle } from '~/framework/components/text';
import { IconOnOff } from '~/ui/icons/IconOnOff';

export const shouldTabBarBeVisible = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
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

// ToDo : remove magic values here, replace with RN6
export const createMainTabNavOption = (title: string, icon?: string | PictureProps, iconFocus?: PictureProps) => {
  const computePicture = (icon: PictureProps) => {
    if (icon.type === 'NamedSvg') {
      icon.height = UI_SIZES.elements.tabbarIconSize;
      icon.width = UI_SIZES.elements.tabbarIconSize;
      // icon.style = { marginBottom: UI_SIZES.spacing.small };
    } else if (icon.type === 'Image') {
      icon.style = {
        height: UI_SIZES.elements.tabbarIconSize,
        // marginBottom: UI_SIZES.spacing.small,
        width: UI_SIZES.elements.tabbarIconSize,
      };
    } else if (icon.type === 'Icon') {
      icon.size = UI_SIZES.elements.tabbarIconSize;
      // icon.style = { marginBottom: UI_SIZES.spacing.small };
    }
    return icon;
  };
  if (!icon) {
    return {
      tabBarIcon: ({ focused }) => <View />,
      tabBarLabel: ({ focused }) => <MainTabNavigationLabel focused={focused}>{title}</MainTabNavigationLabel>,
    };
  } else if (typeof icon === 'string') {
    return {
      tabBarIcon: ({ focused }) => (
        <IconOnOff
          size={UI_SIZES.elements.tabbarIconSize}
          name={icon}
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
            <Picture {...iconFocus} color={theme.palette.primary.regular} />
          ) : (
            <Picture {...icon} color={theme.ui.text.light} />
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

const TabBarText = styled.Text({
  alignSelf: 'center',
  fontSize: 10,
  lineHeight: UI_SIZES.screen.bottomInset ? getScaleDimension(14, 'height') : TextSizeStyle.Small.lineHeight,
});

const MainTabNavigationLabel = props => (
  <TabBarText numberOfLines={1} style={{ color: props.focused ? theme.palette.primary.regular : theme.ui.text.light }}>
    {props.children}
  </TabBarText>
);
