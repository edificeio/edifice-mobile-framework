/**
 * constants used for the navBar setup accross navigators
 */
import { HeaderBackButton } from '@react-navigation/elements';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as React from 'react';
import { Platform, TextStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NavBarAction } from '~/framework/components/navigation';
import { BodyBoldText, TextFontStyle } from '~/framework/components/text';
import { IAuthNavigationParams } from '~/framework/modules/auth/navigation';
import { isEmpty } from '~/framework/util/object';

import { isModalModeOnThisRoute } from './hideTabBarAndroid';

const backbuttonStyle = {
  marginHorizontal: 0,
};

const navBarTitleStyle: TextStyle = {
  color: theme.ui.text.inverse,
  textAlign: 'center',
  width: UI_SIZES.screen.width - 2 * UI_SIZES.elements.navbarIconSize - 3 * UI_SIZES.elements.navbarMargin,
};

export const navBarTitle = (title?: string, style?: TextStyle) =>
  !isEmpty(title) && Platform.OS === 'android'
    ? () => (
        <BodyBoldText numberOfLines={1} style={[navBarTitleStyle, style ?? {}]}>
          {title}
        </BodyBoldText>
      )
    : title ?? '';

export const navBarOptions: (props: {
  route: RouteProp<IAuthNavigationParams, string>;
  navigation: NativeStackNavigationProp<ParamListBase>;
  title?: string;
  titleStyle?: TextStyle;
}) => NativeStackNavigationOptions = ({ route, navigation, title, titleStyle }) =>
  ({
    headerStyle: {
      backgroundColor: theme.palette.primary.regular,
    },
    headerTitle: navBarTitle(title, titleStyle),
    headerTitleAlign: 'center',
    headerTitleStyle: {
      ...TextFontStyle.Bold,
      color: undefined, // override default test color
    },
    headerLeft: props => {
      const navState = navigation.getState();
      // Here use canGoBack() is not sufficient. We have to manually check how many routes have been traversed in the current stack.
      if (navigation.canGoBack() && navState.routes.length > 1 && navState.routes.findIndex(r => r.key === route.key) > 0) {
        // On modals, we want to use a close button instead of a back button
        if (isModalModeOnThisRoute(route.name)) {
          return <NavBarAction {...props} onPress={navigation.goBack} icon="ui-close" />;
        } else {
          return <HeaderBackButton {...props} style={backbuttonStyle} onPress={navigation.goBack} />;
        }
      } else return null;
    },
    headerTintColor: theme.ui.text.inverse,
    headerBackVisible: false, // Since headerLeft replaces native back, we don't want him to show when there's no headerLeft
    headerShadowVisible: true,
    headerBackButtonMenuEnabled: false, // Since headerLeft replaces native back, we cannot use this.
    freezeOnBlur: true,
  } as NativeStackNavigationOptions);
