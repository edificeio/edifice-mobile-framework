/**
 * constants used for the navBar setup accross navigators
 */
import * as React from 'react';
import { StyleSheet, TextStyle } from 'react-native';

import { HeaderBackButton } from '@react-navigation/elements';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackNavigationProp } from '@react-navigation/native-stack';

import theme from '~/app/theme';
import { NavBarAction } from '~/framework/components/navigation';
import { TextFontStyle } from '~/framework/components/text';

import { addCrossIconBlackOnThisRoute, isModalModeOnThisRoute } from './hideTabBarAndroid';

const styles = StyleSheet.create({
  backbutton: {
    marginHorizontal: 0,
  },
  navBarTitleStyle: {
    ...TextFontStyle.Bold,
    color: theme.ui.text.inverse,
    textAlign: 'center',
  },
});

/**
 * @deprecated use screenOptions() or modalScreenOptions()

 */
export const navBarOptions: (props: {
  route: RouteProp<ParamListBase, string>;
  navigation: NativeStackNavigationProp<ParamListBase>;
  title?: string;
  backButtonTestID?: string;
}) => NativeStackNavigationOptions = ({ backButtonTestID, navigation, route, title }) =>
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
              displayMode="minimal"
              style={styles.backbutton}
              testID={backButtonTestID}
              onPress={navigation.goBack}
            />
          );
        }
      } else return null;
    },

    title: title,
  }) as NativeStackNavigationOptions;
