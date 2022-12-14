import * as React from 'react';
import { ActivityIndicator, LayoutChangeEvent, StyleProp, TouchableOpacity, View, ViewProps, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { Picture } from '~/framework/components//picture';
import { SmallBoldText, TextSizeStyle } from '~/framework/components//text';
import { UI_SIZES } from '~/framework/components/constants';
import { openUrl } from '~/framework/util/linking';

export interface ActionButtonProps {
  text?: string;
  iconName?: string;
  emoji?: string;
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
  const [buttonWidth, setButtonWidth] = React.useState(0);
  const Component: React.ComponentType<ViewProps> = disabled ? View : TouchableOpacity;

  const commonViewStyle = {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: disabled ? theme.ui.text.light : theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.huge,
    borderWidth: UI_SIZES.elements.actionButtonBorder,
    flexDirection: 'row',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
    width: buttonWidth || undefined,
  };

  const pictureSize = TextSizeStyle.Normal.fontSize! + (TextSizeStyle.Normal.lineHeight! - TextSizeStyle.Normal.fontSize!) / 2;

  const pictureStyle = {
    marginLeft: UI_SIZES.spacing.minor,
  };

  const textStyle = {
    primary: {
      color: theme.ui.text.inverse,
    },
    secondary: {
      color: disabled ? theme.ui.text.light : theme.palette.primary.regular,
    },
  };

  const viewStyle = {
    primary: {
      backgroundColor: disabled ? theme.ui.text.light : theme.palette.primary.regular,
    },
    secondary: {},
  };

  const pictureFill = {
    primary: theme.ui.text.inverse,
    secondary: disabled ? theme.ui.text.light : theme.palette.primary.regular,
  };

  return (
    <Component
      onLayout={e => {
        if (!buttonWidth) e.nativeEvent.layout.width += 2 * UI_SIZES.elements.actionButtonBorder;
        const newWidth = e.nativeEvent.layout.width;
        if (newWidth !== buttonWidth) setButtonWidth(newWidth);
        if (onLayout) onLayout(e);
      }}
      style={[commonViewStyle, viewStyle[type ?? 'primary'], style]}
      {...(!disabled
        ? {
            onPress: () => {
              if (action) {
                action();
              }
              if (url) {
                openUrl(url, undefined, undefined, showConfirmation, requireSession);
              }
            },
          }
        : {})}
      {...(loading
        ? {
            disabled: true,
          }
        : {})}>
      {loading ? (
        <ActivityIndicator color={textStyle[type ?? 'primary'].color} style={{ height: TextSizeStyle.Normal.lineHeight }} />
      ) : (
        <>
          <SmallBoldText numberOfLines={1} style={textStyle[type ?? 'primary']}>
            {text}
          </SmallBoldText>
          {url || iconName ? (
            <Picture
              type="NamedSvg"
              name={iconName || 'pictos-external-link'}
              width={pictureSize}
              height={pictureSize}
              fill={pictureFill[type ?? 'primary']}
              style={pictureStyle}
            />
          ) : emoji ? (
            <SmallBoldText numberOfLines={1}>{' ' + emoji}</SmallBoldText>
          ) : null}
        </>
      )}
    </Component>
  );
};
