import styled from '@emotion/native';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationScreenProp, NavigationState } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture, PictureProps } from '~/framework/components/picture';
import { IconOnOff } from '~/ui/icons/IconOnOff';

export const createMainTabNavigator = (routeConfigs, initialRouteName: string = undefined) =>
  createBottomTabNavigator(routeConfigs, {
    initialRouteName,
    defaultNavigationOptions: shouldTabBarBeVisible,
    swipeEnabled: false,
    tabBarOptions: {
      // Colors
      activeTintColor: theme.palette.primary.regular,
      inactiveTintColor: theme.palette.primary.regular,
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
      },
    },
  });

// ToDo : remove magic values here, replace with RN6
export const createMainTabNavOption = (title: string, icon?: string | PictureProps, iconFocus?: PictureProps) => {
  const computePicture = (icon: PictureProps) => {
    if (icon.type === 'NamedSvg') {
      icon.height = icon.width = 24;
      icon.style = { marginTop: -6 }; // MO-142 use UI_SIZES.spacing here
    } else if (icon.type === 'Image') {
      icon.style = { width: 24, height: 24, marginTop: -6 }; // MO-142 use UI_SIZES.spacing here
    } else if (icon.type === 'Icon') {
      icon.size = 24;
      icon.style = { marginTop: -6 }; // MO-142 use UI_SIZES.spacing here
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
      tabBarIcon: ({ focused }) => <IconOnOff size={24} name={icon} focused={focused} style={{ marginTop: -6 }} />, // MO-142 use UI_SIZES.spacing here
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
      icon.style = { width: 24, height: 24, marginTop: -6 }; // MO-142 use UI_SIZES.spacing here
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

const MainTabNavigationLabel = styled.Text(
  {
    alignSelf: 'center',
    fontFamily: 'OpenSans-Regular',
    fontSize: 10,
    marginBottom: UI_SIZES.spacing.tiny,
    marginTop: -UI_SIZES.spacing.small,
  },
  ({ focused }) => ({
    color: focused ? theme.palette.primary.regular : theme.legacy.neutral.subtleLight,
  }),
);

export const shouldTabBarBeVisible = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  };
};
