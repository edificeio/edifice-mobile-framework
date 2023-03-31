/**
 * constants used for the navBar setup accross navigators
 */
import { HeaderBackButton } from '@react-navigation/elements';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as React from 'react';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle } from '~/framework/components/text';
import { IAuthNavigationParams } from '~/framework/modules/auth/navigation';

export const navBarOptions: (props: {
  route: RouteProp<IAuthNavigationParams, string>;
  navigation: NativeStackNavigationProp<ParamListBase>;
}) => NativeStackNavigationOptions = ({ route, navigation }) =>
  ({
    headerStyle: {
      backgroundColor: theme.palette.primary.regular,
    },
    headerTitleStyle: {
      ...TextFontStyle.Bold,
      color: undefined, // override default test color
    },
    headerTitleAlign: 'center',
    headerLeft: props => {
      const navState = navigation.getState();
      // Here use canGoBack() is not sufficient. We have to manually check how many routes have been traversed in the current stack.
      return navigation.canGoBack() && navState.routes.length > 1 && navState.routes.findIndex(r => r.key === route.key) > 0 ? (
        <HeaderBackButton {...props} onPress={navigation.goBack} style={{ marginHorizontal: -UI_SIZES.spacing.minor }} />
      ) : null;
    },
    headerTintColor: theme.ui.text.inverse,
    headerBackVisible: false, // Since headerLeft replaces native back, we don't want him to show when there's no headerLeft
    headerShadowVisible: true,
    headerBackButtonMenuEnabled: false, // Since headerLeft replaces native back, we cannot use this.
    freezeOnBlur: true,
  } as NativeStackNavigationOptions);
