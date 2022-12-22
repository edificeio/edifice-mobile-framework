import * as React from 'react';
import { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { Picture } from '~/framework/components//picture';
import { SmallBoldText, TextSizeStyle } from '~/framework/components//text';
import { openUrl } from '~/framework/util/linking';

import styles from './styles';
import { ActionButtonProps } from './types';

export const pictureSize = TextSizeStyle.Normal.fontSize! + (TextSizeStyle.Normal.lineHeight! - TextSizeStyle.Normal.fontSize!) / 2;

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
}: ActionButtonProps) => {
  const Component = disabled ? View : TouchableOpacity;
  const [layoutWidth, setLayoutWidth] = useState(0);

  // props depending styles
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
        // memoize button width for setting correct width when loading state
        if (!layoutWidth) setLayoutWidth(e?.nativeEvent?.layout?.width);
      }}
      style={[
        styles.commonView,
        disabled ? styles.commonViewDisabled : styles.commonViewEnabled,
        { width: loading ? layoutWidth : undefined },
        viewStyle[type ?? 'primary'],
        style,
      ]}
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
      {...(loading ? { disabled: true } : {})}>
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
              style={styles.picture}
            />
          ) : emoji ? (
            <SmallBoldText numberOfLines={1}>{' ' + emoji}</SmallBoldText>
          ) : null}
        </>
      )}
    </Component>
  );
};