/**
 * constants used for the navBar setup accross navigators
 */
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import { IAuthNavigationParams } from '~/framework/modules/auth/navigation';

import { UI_SIZES } from '../components/constants';
import { NamedSVG } from '../components/picture';
import { SmallInverseText, SmallText, TextFontStyle } from '../components/text';

export const navBarOptions: (props: {
  route: RouteProp<IAuthNavigationParams, string>;
  navigation: any;
}) => NativeStackNavigationOptions = ({ route, navigation }) =>
  ({
    headerStyle: {
      backgroundColor: theme.palette.primary.regular,
    },
    headerTitleStyle: {
      ...TextFontStyle.Bold,
      color: undefined, // override default test color
    },
    headerTintColor: theme.ui.text.inverse,
    headerBackTitleVisible: false,
    headerShadowVisible: true,
    headerBackButtonMenuEnabled: false, // buggy with headerBackTitleVisible: false, ToDo fix issue in RN6
  } as NativeStackNavigationOptions);

const styles = StyleSheet.create({
  navBarActionWrapper: { padding: UI_SIZES.spacing.minor, flexDirection: 'row', alignItems: 'center' },
  navBarActionText: { marginHorizontal: UI_SIZES.spacing.tiny },
  navBarActionDisabled: { opacity: 0.618 }, // 1/phi
});
export function NavBarAction(props: { iconName?: string; title?: string; disabled?: boolean; onPress?: () => void }) {
  const opacityIconStyle = React.useMemo(
    () => (props.disabled ? styles.navBarActionDisabled : undefined),
    [props.disabled],
  );
  const opacityTextStyle = React.useMemo(
    () => (props.disabled ? [styles.navBarActionText, styles.navBarActionDisabled] : styles.navBarActionText),
    [props.disabled],
  );

  return (
    <TouchableOpacity onPress={props.onPress} disabled={props.disabled} style={styles.navBarActionWrapper}>
      {props.iconName ? (
        <NamedSVG
          name={props.iconName}
          fill={theme.ui.text.inverse}
          width={UI_SIZES.elements.navBarIconSize}
          height={UI_SIZES.elements.navBarIconSize}
          style={opacityIconStyle}
        />
      ) : null}
      {props.title ? <SmallInverseText style={opacityTextStyle}>{props.title}</SmallInverseText> : null}
    </TouchableOpacity>
  );
}
