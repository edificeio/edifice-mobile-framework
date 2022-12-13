/**
 * constants used for the navBar setup accross navigators
 */
import { getHeaderTitle, Header, HeaderBackButton } from '@react-navigation/elements';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { IAuthNavigationParams } from '~/framework/modules/auth/navigation';

import { genericHitSlop, UI_SIZES } from '../components/constants';
import { NamedSVG } from '../components/picture';
import { SmallInverseText, TextFontStyle } from '../components/text';

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
      // Here use canGoBack() is not sufficient. We have to manually check how many routes have bee traversed in the current stack.
      return navigation.canGoBack() && navigation.getState().routes.length > 1 ? (
        <HeaderBackButton {...props} onPress={navigation.goBack} style={[{ marginHorizontal: -UI_SIZES.spacing.minor }]} />
        ) : null
      },
    headerTintColor: theme.ui.text.inverse,
    headerBackTitleVisible: false,
    headerShadowVisible: true,
    headerBackButtonMenuEnabled: false, // buggy with headerBackTitleVisible: false, ToDo fix issue in RN6,
  } as NativeStackNavigationOptions);

const styles = StyleSheet.create({
  navBarActionWrapper: { flexDirection: 'row', alignItems: 'center' },
  navBarActionText: { padding: UI_SIZES.spacing.tiny, marginHorizontal: -UI_SIZES.spacing.tiny },
  navBarActionIcon: { marginHorizontal: UI_SIZES.spacing.tiny / 2 },
  navBarActionDisabled: { opacity: 0.618 }, // 1/phi
});
export function NavBarAction(props: { iconName?: string; title?: string; disabled?: boolean; onPress?: () => void }) {
  const opacityIconStyle = React.useMemo(() => (props.disabled ? styles.navBarActionDisabled : undefined), [props.disabled]);
  const opacityTextStyle = React.useMemo(
    () => (props.disabled ? [styles.navBarActionText, styles.navBarActionDisabled] : styles.navBarActionText),
    [props.disabled],
  );

  return (
    <TouchableOpacity onPress={props.onPress} hitSlop={genericHitSlop} disabled={props.disabled} style={styles.navBarActionWrapper}>
      {props.iconName ? (
        <NamedSVG
          name={props.iconName}
          fill={theme.ui.text.inverse}
          width={UI_SIZES.elements.navBarIconSize}
          height={UI_SIZES.elements.navBarIconSize}
          style={[opacityIconStyle, styles.navBarActionIcon]}
        />
      ) : null}
      {props.title ? <SmallInverseText style={opacityTextStyle}>{props.title}</SmallInverseText> : null}
    </TouchableOpacity>
  );
}
