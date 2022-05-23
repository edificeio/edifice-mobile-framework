import * as React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { transformedSrc } from '~/infra/oauth';

import { DEPRECATED_getCurrentPlatform } from '../util/_legacy_appConf';
import { openUrl } from '../util/linking';
import { UI_SIZES } from './constants';
import { Picture } from './picture';
import { TextSemiBold } from './text';

export interface ActionButtonProps {
  text: string;
  iconName?: string;
  url?: string;
  action?: () => void;
  disabled?: boolean;
  type?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export const ActionButton = ({ text, iconName, url, action, disabled, type, style }: ActionButtonProps) => {
  const Component = disabled ? View : TouchableOpacity;
  const viewStyle = {
    primary: {
      backgroundColor: disabled ? theme.color.neutral.regular : theme.color.secondary.regular,
      opacity: disabled ? 0.5 : 1,
    },
    secondary: {
      borderColor: disabled ? theme.color.neutral.regular : theme.color.secondary.regular,
      borderWidth: 2,
      opacity: disabled ? 0.5 : 1,
    },
  };
  const textStyle = {
    primary: {
      color: theme.color.text.inverse,
    },
    secondary: {
      color: disabled ? theme.color.neutral.regular : theme.color.secondary.regular,
    },
  };
  const pictureFill = {
    primary: theme.color.text.inverse,
    secondary: disabled ? theme.color.neutral.regular : theme.color.secondary.regular,
  };
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
      <TextSemiBold numberOfLines={1} style={[ActionButton.Style.textCommon, textStyle[type ?? 'primary']]}>
        {text}
      </TextSemiBold>
      {url || iconName ? (
        <Picture
          type="NamedSvg"
          name={iconName || 'pictos-external-link'}
          width={UI_SIZES.dimensions.width.large}
          height={UI_SIZES.dimensions.height.large}
          fill={pictureFill[type ?? 'primary']}
          style={ActionButton.Style.picture}
        />
      ) : null}
    </Component>
  );
};

const lh = UI_SIZES.getResponsiveStyledLineHeight();

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
    marginRight: UI_SIZES.spacing.smallPlus,
    lineHeight: lh,
    height: lh,
  },
  picture: {
    marginLeft: UI_SIZES.spacing.smallPlus,
  },
});
