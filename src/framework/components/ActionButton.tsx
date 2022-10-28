import * as React from 'react';
import { ActivityIndicator, LayoutChangeEvent, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { Picture } from '~/framework/components//picture';
import { SmallBoldText } from '~/framework/components//text';
import { UI_SIZES } from '~/framework/components/constants';
import { openUrl } from '~/framework/util/linking';
import { transformedSrc } from '~/infra/oauth';

export interface ActionButtonProps {
  text: string;
  iconName?: string;
  emoji?: string;
  showIcon?: boolean;
  action?: () => void;
  url?: string;
  showConfirmation?: boolean;
  requireSession?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined;
}

export const ActionButton = ({
  text,
  iconName,
  emoji,
  showIcon = true,
  url,
  showConfirmation = true,
  requireSession = true,
  action,
  disabled,
  loading,
  type,
  style,
  onLayout,
}: ActionButtonProps) => {
  const Component = disabled ? View : TouchableOpacity;
  const viewStyle = {
    primary: {
      backgroundColor: disabled ? theme.ui.text.light : theme.palette.primary.regular,
      opacity: disabled ? 0.5 : 1,
    },
    secondary: {
      borderColor: disabled ? theme.ui.text.light : theme.palette.primary.regular,
      opacity: disabled ? 0.5 : 1,
      borderWidth: 2,
      paddingVertical: UI_SIZES.spacing.tiny, // Note: we compendate for "borderWith: 2" so the text doesn't get cropped
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

  return loading ? (
    <ActivityIndicator size="large" color={theme.palette.primary.regular} />
  ) : (
    <Component
      onLayout={e => onLayout && onLayout(e)}
      style={[ActionButton.Style.viewCommon, viewStyle[type ?? 'primary'], style]}
      {...(!disabled
        ? {
            onPress: () => {
              if (action) {
                action();
              }
              if (url) {
                openUrl(transformedSrc(url), undefined, undefined, showConfirmation, requireSession);
              }
            },
          }
        : {})}>
      <SmallBoldText numberOfLines={1} style={[{ lineHeight: undefined }, textStyle[type ?? 'primary']]}>
        {text}
      </SmallBoldText>
      {showIcon ? (
        url || iconName ? (
          <Picture
            type="NamedSvg"
            name={iconName || 'pictos-external-link'}
            width={UI_SIZES.dimensions.width.large}
            height={UI_SIZES.dimensions.height.large}
            fill={pictureFill[type ?? 'primary']}
            style={ActionButton.Style.picture}
          />
        ) : emoji ? (
          <SmallBoldText numberOfLines={1} style={[{ lineHeight: undefined, marginBottom: 1 }]}>
            {` ${emoji}`}
          </SmallBoldText>
        ) : null
      ) : null}
    </Component>
  );
};

ActionButton.Style = StyleSheet.create({
  viewCommon: {
    height: UI_SIZES.dimensions.height.largePlus,
    paddingHorizontal: UI_SIZES.spacing.medium,
    borderRadius: UI_SIZES.radius.extraLarge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  picture: {
    marginLeft: UI_SIZES.spacing.minor,
  },
});
