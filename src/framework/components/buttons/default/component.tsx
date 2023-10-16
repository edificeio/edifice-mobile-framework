import * as React from 'react';
import { useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
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
    round,
    action,
  } = props;
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [loadingButton, setLoadingButton] = useState(false);

  const contentColorStyle = { color: contentColor ?? theme.palette.grey.graphite };

  const openActionUrl = async () => {
    try {
      setLoadingButton(true);
      await openUrl(url, undefined, undefined, showConfirmation, requireSession);
    } catch {
      Toast.showError(I18n.get('toast-error-text'));
    } finally {
      setLoadingButton(false);
    }
  };

  const onPressAction = () => {
    if (url) return openActionUrl();
    if (action) return action();
  };

  const memorizeWidthButton = e => {
    // memoize button width for setting correct width when loading state
    if (!layoutWidth || e?.nativeEvent?.layout?.width > layoutWidth) setLayoutWidth(e?.nativeEvent?.layout?.width);
    if (!layoutHeight) setLayoutHeight(e?.nativeEvent?.layout?.height);
  };

  const renderIcon = (iconName, position) => {
    if ((!iconName && !url) || (!!url && position === 'left')) return;
    const iconStyle = position === 'right' ? styles.iconRight : styles.iconLeft;
    return (
      <NamedSVG
        name={iconName ?? 'pictos-external-link'}
        width={BUTTON_ICON_SIZE}
        height={BUTTON_ICON_SIZE}
        fill={contentColor ?? theme.palette.grey.graphite}
        style={!round ? iconStyle : null}
      />
    );
  };

  const renderContent = () => {
    if (loading || loadingButton)
      return <ActivityIndicator color={contentColor ?? theme.palette.grey.graphite} style={styles.indicator} />;
    return (
      <>
        {renderIcon(iconLeft, 'left')}
        <SmallBoldText numberOfLines={1} style={[styles.text, contentColorStyle]}>
          {text}
        </SmallBoldText>
        {renderIcon(iconRight, 'right')}
      </>
    );
  };

  return (
    <TouchableOpacity
      onLayout={memorizeWidthButton.bind(this)}
      {...props}
      style={[
        styles.commonView,
        style,
        { ...(loading || loadingButton ? { width: layoutWidth, height: layoutHeight } : undefined) },
      ]}
      onPress={onPressAction}
      {...(loading || disabled ? { disabled: true } : {})}
      {...(testID ? { testID } : {})}>
      {renderContent()}
    </TouchableOpacity>
  );
};
