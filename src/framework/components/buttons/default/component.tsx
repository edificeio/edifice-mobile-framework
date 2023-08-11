import * as React from 'react';
import { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';

import styles from './styles';
import { DefaultButtonProps } from './types';

export const BUTTON_ICON_SIZE = UI_SIZES.elements.icon.small;

export const DefaultButton = (props: DefaultButtonProps) => {
  const {
    text,
    iconLeft,
    iconRight,
    url,
    showConfirmation = true,
    requireSession = true,
    loading,
    contentColor,
    testID,
    disabled,
    style,
    action,
  } = props;
  const [layoutWidth, setLayoutWidth] = useState(0);

  const contentColorStyle = { color: contentColor ?? theme.palette.grey.graphite };

  const onPressAction = () => {
    if (url) return openUrl(url, undefined, undefined, showConfirmation, requireSession);
    if (action) return action();
  };

  const memorizeWidthButton = e => {
    // memoize button width for setting correct width when loading state
    if (!layoutWidth) setLayoutWidth(e?.nativeEvent?.layout?.width);
  };

  const renderIcon = (iconName, position) => {
    if ((!iconName && !url) || (!!url && position === 'left')) return;
    const iconStyle = position === 'right' ? styles.iconRight : styles.iconLeft;
    return (
      <NamedSVG
        name={iconName ?? 'pictos-external-link'}
        width={BUTTON_ICON_SIZE}
        height={BUTTON_ICON_SIZE}
        fill={contentColor ?? theme.ui.text.regular}
        style={[iconStyle]}
      />
    );
  };

  const renderContent = () => {
    if (loading) return <ActivityIndicator color={contentColor ?? theme.palette.grey.graphite} style={styles.indicator} />;
    return (
      <>
        {renderIcon(iconLeft, 'left')}
        <SmallBoldText numberOfLines={1} style={contentColorStyle}>
          {text}
        </SmallBoldText>
        {renderIcon(iconRight, 'right')}
      </>
    );
  };

  return (
    <TouchableOpacity
      {...props}
      onLayout={memorizeWidthButton.bind(this)}
      style={[styles.commonView, { width: loading ? layoutWidth : undefined }, style]}
      onPress={onPressAction}
      {...(loading || disabled ? { disabled: true } : {})}
      {...(testID ? { testID } : {})}>
      {renderContent()}
    </TouchableOpacity>
  );
};
