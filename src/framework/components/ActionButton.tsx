import * as React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { transformedSrc } from '~/infra/oauth';

import { DEPRECATED_getCurrentPlatform } from '../util/_legacy_appConf';
import { openUrl } from '../util/linking';
import { UI_SIZES } from './constants';
import { Picture } from './picture';
import { TextSemiBold, TextSizeStyle, rem, remlh } from './text';

export interface ActionButtonProps {
  text: string;
  iconName?: string;
  leftIcon?: boolean;
  url?: string;
  action?: () => void;
  disabled?: boolean;
  type?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export const ActionButton = ({ text, iconName, leftIcon, url, action, disabled, type, style }: ActionButtonProps) => {
  const viewStyle = {
    primary: {
      backgroundColor: disabled ? theme.ui.text.light : theme.palette.primary.regular,
      opacity: disabled ? 0.5 : 1,
    },
    secondary: {
      borderColor: disabled ? theme.ui.text.light : theme.palette.primary.regular,
      borderWidth: 2,
      opacity: disabled ? 0.5 : 1,
    },
  };
  const textStyle = {
    primary: {
      color: theme.ui.text.inverse,
    },
    secondary: {
      color: disabled ? theme.ui.text.light : theme.palette.primary.regular,
    },
  };
  const pictureFill = {
    primary: theme.ui.text.inverse,
    secondary: disabled ? theme.ui.text.light : theme.palette.primary.regular,
  };
  const Component = disabled ? View : TouchableOpacity;
  const PictureComponent = () => (
    <Picture
      type="NamedSvg"
      name={iconName || 'pictos-external-link'}
      width={UI_SIZES.dimensions.width.large}
      height={UI_SIZES.dimensions.height.large}
      fill={pictureFill[type ?? 'primary']}
      style={leftIcon ? { marginRight: UI_SIZES.spacing.smallPlus } : { marginLeft: UI_SIZES.spacing.smallPlus }}
    />
  );
  return (
    <Component
      style={[ActionButton.Style.viewCommon, viewStyle[type ?? 'primary'], style]}
      {...(!disabled
        ? {
            onPress: () => {
              if (action) {
                action();
              }
              if (url) {
                //TODO: create generic function inside oauth (use in myapps, etc.)
                if (!DEPRECATED_getCurrentPlatform()) {
                  return null;
                }
                const fullUrl = transformedSrc(url);
                openUrl(fullUrl);
              }
            },
          }
        : {})}>
      {leftIcon && (url || iconName) ? <PictureComponent /> : null}
      <TextSemiBold numberOfLines={1} style={[ActionButton.Style.textCommon, textStyle[type ?? 'primary']]}>
        {text}
      </TextSemiBold>
      {!leftIcon && (url || iconName) ? <PictureComponent /> : null}
    </Component>
  );
};
ActionButton.Style = StyleSheet.create({
  viewCommon: {
    height: UI_SIZES.dimensions.height.largePlus,
    paddingVertical: UI_SIZES.spacing.smallPlus,
    paddingHorizontal: UI_SIZES.spacing.large,
    borderRadius: UI_SIZES.radius.extraLarge,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  textCommon: {
    lineHeight: remlh(1),
    height: remlh(1),
  },
});
