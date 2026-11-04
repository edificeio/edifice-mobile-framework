/**
 * Buttons of the header rendered in React: all of them on Android, the ones with an icon of the app (SVG) on iOS.
 * Android rules (as the native buttons, and the close button of a modal, see `modalCloseButtonOptions`): `headerButtonSizeAndroid`
 * (48dp, Material Design) and the borderless ripple of the native buttons.
 */
import * as React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { MenuView } from '@react-native-menu/menu';
import type { NativeStackHeaderItemProps } from '@react-navigation/native-stack';

import theme from '~/app/theme';
import { UI_SIZES, UI_VALUES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';

import { findMenuAction, toMenuViewActions } from './menu';
import type { HeaderMenu } from './types';

const styles = StyleSheet.create({
  // Android: the size of the native buttons
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: UI_SIZES.navigation.headerButtonSizeAndroid,
    minWidth: UI_SIZES.navigation.headerButtonSizeAndroid,
  },
  disabled: { opacity: UI_VALUES.opacity.half },
  // Android: a text button has the side padding of the Material text buttons (12dp)
  textButton: { paddingHorizontal: UI_SIZES.spacing.small },
});

/** Style of a button: the size of the native buttons on Android (iOS sizes the items itself), its padding when it shows text. */
const getButtonStyle = (isText: boolean, disabled: boolean | undefined) => [
  Platform.OS === 'android' && styles.button,
  Platform.OS === 'android' && isText && styles.textButton,
  disabled && styles.disabled,
];

// Android: borderless (a circle) around an icon, as the native buttons; bounded (the whole button) around text
const iconRipple = { borderless: true, color: UI_SIZES.navigation.headerButtonRippleColor.light, radius: 20 };
const textRipple = { borderless: false, color: UI_SIZES.navigation.headerButtonRippleColor.light };

// react-native-menu needs the color of the icons explicitly on iOS (see `PopupMenu`)
const menuIconColors =
  Platform.OS === 'ios'
    ? { destructive: '#FF3B30', regular: '#000000' }
    : { destructive: theme.palette.status.failure.regular, regular: theme.palette.grey.black };

export interface HeaderActionButtonProps extends Pick<NativeStackHeaderItemProps, 'tintColor'> {
  /** An icon of the app, drawn with the color of the header; or any element (an avatar…). Without it, `label` is shown. */
  icon?: SvgIconName | React.ReactElement;
  /** Shown without icon; what screen readers say by default. */
  label?: string;
  /** What tests look for: never translated. */
  testID: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const HeaderActionContent = ({ icon, label, tintColor }: Pick<HeaderActionButtonProps, 'icon' | 'label' | 'tintColor'>) => {
  if (typeof icon === 'string')
    return <Svg name={icon} fill={tintColor} width={UI_SIZES.elements.navbarIconSize} height={UI_SIZES.elements.navbarIconSize} />;
  if (icon) return icon;
  return (
    <BodyBoldText numberOfLines={1} style={tintColor ? { color: tintColor } : undefined}>
      {label}
    </BodyBoldText>
  );
};

/** A button of the header, as the items render it. For a `headerCustom` action that reads hooks. */
export const HeaderActionButton = ({
  accessibilityHint,
  accessibilityLabel,
  disabled,
  icon,
  label,
  onPress,
  testID,
  tintColor,
}: HeaderActionButtonProps) => (
  <Pressable
    accessible
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel ?? label}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    android_ripple={icon ? iconRipple : textRipple}
    disabled={disabled}
    hitSlop={16}
    onPress={onPress}
    style={getButtonStyle(!icon, disabled)}
    testID={testID}>
    <HeaderActionContent icon={icon} label={label} tintColor={tintColor} />
  </Pressable>
);

/**
 * A button of the header that opens a menu (`MenuView` of react-native-menu). The button itself is not pressable: the menu opens on
 * press. Disabled, it shows the button without the menu.
 */
export const HeaderMenuButton = ({
  accessibilityHint,
  accessibilityLabel,
  disabled,
  icon,
  isAnchoredToRight,
  items,
  label,
  testID,
  tintColor,
  title,
}: Omit<HeaderMenu, 'type' | 'icon' | 'ios'> &
  Pick<HeaderActionButtonProps, 'icon' | 'tintColor'> & { isAnchoredToRight: boolean }) => {
  const actions = React.useMemo(() => toMenuViewActions(items, Platform.OS === 'ios' ? 'ios' : 'android', menuIconColors), [items]);
  const button = (
    <View
      accessible
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={getButtonStyle(!icon, disabled)}
      testID={testID}>
      <HeaderActionContent icon={icon} label={label} tintColor={tintColor} />
    </View>
  );
  if (disabled) return button;
  return (
    <MenuView
      actions={actions}
      isAnchoredToRight={isAnchoredToRight}
      onPressAction={({ nativeEvent }) => findMenuAction(items, nativeEvent.event)?.onPress()}
      title={title}>
      {button}
    </MenuView>
  );
};
