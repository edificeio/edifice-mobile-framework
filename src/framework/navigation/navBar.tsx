/**
 * constants used for the navBar setup accross navigators
 */
import * as React from 'react';
import { Platform, StyleSheet, TextStyle } from 'react-native';

import { HeaderBackButton } from '@react-navigation/elements';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackNavigationProp } from '@react-navigation/native-stack';

import { addCrossIconBlackOnThisRoute, isModalModeOnThisRoute } from './hideTabBarAndroid';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NavBarAction } from '~/framework/components/navigation';
import { BodyBoldText, TextFontStyle } from '~/framework/components/text';
import { AuthNavigationParams } from '~/framework/modules/auth/navigation';

const ICON_SIZE_NAVBAR = UI_SIZES.elements.navbarIconSize + 2 * UI_SIZES.spacing.tiny;

const styles = StyleSheet.create({
  backbutton: {
    marginHorizontal: 0,
  },
  navBarTitleStyle: {
    ...TextFontStyle.Bold,
    color: theme.ui.text.inverse,
    textAlign: 'center',
  },
  navBarTitleStyleAndroid: {
    width: UI_SIZES.screen.width - 2 * ICON_SIZE_NAVBAR - 2 * UI_SIZES.elements.navbarMargin,
  },
  navBarTitleStyleAndroid3icons: {
    width: UI_SIZES.screen.width - 4 * ICON_SIZE_NAVBAR - 2 * UI_SIZES.elements.navbarMargin - 1 * UI_SIZES.spacing.tiny,
  },
});

export const navBarTitle = (title?: string, style?: TextStyle, testID?: string, nbNavBarIcon?: number) =>
  Platform.select({
    android: () => (
      <BodyBoldText
        numberOfLines={1}
        style={[
          styles.navBarTitleStyle,
          nbNavBarIcon === 3 ? styles.navBarTitleStyleAndroid3icons : styles.navBarTitleStyleAndroid,
          style ?? {},
        ]}
        testID={testID}>
        {title ?? ''}
      </BodyBoldText>
    ),
    default: title,
  });

export const navBarOptions: (props: {
  route: RouteProp<AuthNavigationParams, string>;
  navigation: NativeStackNavigationProp<ParamListBase>;
  title?: string;
  titleStyle?: TextStyle;
  titleTestID?: string;
  backButtonTestID?: string;
}) => NativeStackNavigationOptions = ({ backButtonTestID, navigation, route, title, titleStyle, titleTestID }) =>
  ({
    // Since headerLeft replaces native back, we cannot use this.
    freezeOnBlur: true,

    headerBackButtonMenuEnabled: false,

    headerBackVisible: false,

    headerLeft: props => {
      const navState = navigation.getState();
      // Here use canGoBack() is not sufficient. We have to manually check how many routes have been traversed in the current stack.
      if (navigation.canGoBack() && navState.routes.length > 1 && navState.routes.findIndex(r => r.key === route.key) > 0) {
        // On modals, we want to use a close button instead of a back button
        if (isModalModeOnThisRoute(route.name)) {
          return (
            <NavBarAction
              {...props}
              {...(addCrossIconBlackOnThisRoute(route.name) ? { color: theme.palette.grey.darkness } : {})}
              onPress={navigation.goBack}
              icon="ui-close"
              testID={backButtonTestID}
            />
          );
        } else {
          return (
            <HeaderBackButton
              {...props}
              labelVisible={false}
              style={styles.backbutton}
              testID={backButtonTestID}
              onPress={navigation.goBack}
            />
          );
        }
      } else return null;
    },

    // Since headerLeft replaces native back, we don't want him to show when there's no headerLeft
    headerShadowVisible: true,

    headerStyle: {
      backgroundColor: theme.palette.primary.regular,
    },

    headerTintColor: theme.ui.text.inverse,

    headerTitle: navBarTitle(title, titleStyle, titleTestID),

    headerTitleAlign: 'center',

    headerTitleStyle: styles.navBarTitleStyle,
  }) as NativeStackNavigationOptions;
