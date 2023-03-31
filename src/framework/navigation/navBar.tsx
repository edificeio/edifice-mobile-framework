/**
 * constants used for the navBar setup accross navigators
 */
import { HeaderBackButton } from '@react-navigation/elements';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, genericHitSlop } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallInverseText, TextFontStyle } from '~/framework/components/text';
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

const styles = StyleSheet.create({
  navBarActionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBarActionWrapperIcon: {
    justifyContent: 'center',
    height: UI_SIZES.dimensions.height.hug,
    width: UI_SIZES.dimensions.width.hug,
  },
  navBarActionText: {
    padding: UI_SIZES.spacing.tiny,
    marginHorizontal: -UI_SIZES.spacing.tiny,
  },
  navBarActionIcon: {
    height: UI_SIZES.elements.icon,
  },
  navBarActionDisabled: {
    opacity: 0.618,
  }, // 1/phi
});
export function NavBarAction(props: { iconName?: string; title?: string; disabled?: boolean; onPress?: () => void }) {
  const opacityIconStyle = React.useMemo(() => (props.disabled ? styles.navBarActionDisabled : undefined), [props.disabled]);
  const opacityTextStyle = React.useMemo(
    () => (props.disabled ? [styles.navBarActionText, styles.navBarActionDisabled] : styles.navBarActionText),
    [props.disabled],
  );

  const Component = props.onPress ? TouchableOpacity : View;

  return (
    <Component
      {...(props.onPress ? { onPress: props.onPress } : {})}
      hitSlop={genericHitSlop}
      disabled={props.disabled}
      style={[styles.navBarActionWrapper, { ...(props.iconName ? styles.navBarActionWrapperIcon : {}) }]}>
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
    </Component>
  );
}

export function NavBarActionsGroup(props: { elements: JSX.Element[] }) {
  const stylesGroup = StyleSheet.create({
    container: {
      width: props.elements.length * UI_SIZES.dimensions.width.hug + (props.elements.length - 1) * UI_SIZES.spacing.tiny,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
  return <View style={stylesGroup.container}>{props.elements.map(element => element)}</View>;
}
