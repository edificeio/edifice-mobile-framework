import styled from '@emotion/native';
import * as React from 'react';
import { NavigationScreenProp, NavigationState } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture, PictureProps } from '~/framework/components/picture';
import { CommonStyles } from '~/styles/common/styles';
import { IconOnOff } from '~/ui/icons/IconOnOff';

export const createMainTabNavigator = (routeConfigs, initialRouteName: string = undefined) =>
  createBottomTabNavigator(routeConfigs, {
    initialRouteName,
    defaultNavigationOptions: shouldTabBarBeVisible,
    swipeEnabled: false,
    tabBarOptions: {
      // Colors
      activeTintColor: CommonStyles.mainColorTheme,
      inactiveTintColor: CommonStyles.mainColorTheme,
      // Label and icon
      showIcon: true,
      showLabel: true,
      // Style
      style: {
        backgroundColor: CommonStyles.tabBottomColor,
        borderTopColor: CommonStyles.borderColorLighter,
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

export const createMainTabNavOption = (title: string, icon: string | PictureProps) => {
  if (typeof icon === 'string') {
    return {
      tabBarIcon: ({ focused }) => <IconOnOff size={24} name={icon} focused={focused} style={{ marginTop: -6 }} />,
      tabBarLabel: ({ focused }) => <MainTabNavigationLabel focused={focused}>{title}</MainTabNavigationLabel>,
    };
  } else {
    if (icon.type === 'NamedSvg') {
      icon.height = icon.width = 24;
      icon.style = { marginTop: -6 };
    } else {
      icon.style = { width: 24, height: 24, marginTop: -6 };
    }
    return {
      tabBarIcon: ({ focused }) => <Picture {...icon} />,
      tabBarLabel: ({ focused }) => <MainTabNavigationLabel focused={focused}>{title}</MainTabNavigationLabel>,
    };
  }
};

const MainTabNavigationLabel = styled.Text(
  {
    alignSelf: 'center',
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 10,
    marginBottom: 4,
    marginTop: -12,
  },
  ({ focused }) => ({
    color: focused ? theme.color.secondary.regular : CommonStyles.textTabBottomColor,
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
