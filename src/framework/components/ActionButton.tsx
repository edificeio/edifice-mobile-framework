import * as React from 'react';
import { ActivityIndicator, LayoutChangeEvent, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { Picture } from '~/framework/components//picture';
import { SmallBoldText, TextSizeStyle } from '~/framework/components//text';
import { UI_SIZES } from '~/framework/components/constants';
import { openUrl } from '~/framework/util/linking';

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
  const [isButtonMeasured, setIsButtonMeasured] = React.useState(false);
  const [buttonWidth, setButtonWidth] = React.useState(0);
  const Component = disabled ? View : TouchableOpacity;
  const commonViewStyle = {
    width: isButtonMeasured ? buttonWidth : undefined,
    borderColor: disabled ? theme.ui.text.light : theme.palette.primary.regular,
    borderWidth: 2,
    opacity: disabled ? 0.5 : 1,
  };
  const viewStyle = {
    primary: {
      backgroundColor: disabled ? theme.ui.text.light : theme.palette.primary.regular,
    },
    secondary: {},
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
  return (
    <Component
      onLayout={e => {
        if (onLayout) {
          onLayout(e);
        } else if (!isButtonMeasured) {
          setButtonWidth(e.nativeEvent.layout.width);
          setIsButtonMeasured(true);
        }
      }}
      style={[ActionButton.Style.viewCommon, commonViewStyle, viewStyle[type ?? 'primary'], style]}
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
        <ActivityIndicator
          size="small"
          color={textStyle[type ?? 'primary'].color}
          style={{ height: TextSizeStyle.Normal.lineHeight }}
        />
      ) : (
        <>
          <SmallBoldText numberOfLines={1} style={textStyle[type ?? 'primary']}>
            {text}
          </SmallBoldText>
          {showIcon ? (
            url || iconName ? (
              <Picture
                type="NamedSvg"
                name={iconName || 'pictos-external-link'}
                width={TextSizeStyle.Small.lineHeight}
                height={TextSizeStyle.Small.lineHeight}
                fill={pictureFill[type ?? 'primary']}
                style={ActionButton.Style.picture}
              />
            ) : emoji ? (
              <SmallBoldText numberOfLines={1}>{' ' + emoji}</SmallBoldText>
            ) : null
          ) : null}
        </>
      )}
    </Component>
  );
};

ActionButton.Style = StyleSheet.create({
  viewCommon: {
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    borderRadius: UI_SIZES.radius.huge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  picture: {
    marginLeft: UI_SIZES.spacing.minor,
  },
});
