/**
 * constantes used for the navBar setup accross navigators
 */
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import theme from '~/app/theme';
import { IAuthNavigationParams } from '~/framework/modules/auth/navigation';

export const navBarOptions: (props: {
  route: RouteProp<IAuthNavigationParams, string>;
  navigation: any;
}) => NativeStackNavigationOptions = ({ route, navigation }) =>
  ({
    headerStyle: {
      backgroundColor: theme.palette.primary.regular,
    },
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerTintColor: theme.ui.text.inverse,
    headerBackTitleVisible: false,
    headerShadowVisible: true,
    headerBackButtonMenuEnabled: false, // buggy with headerBackTitleVisible: false, ToDo fix issue in RN6
  } as NativeStackNavigationOptions);
