import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { ActivityIndicator, Pressable, PressableProps, Text, useWindowDimensions, View } from 'react-native';

import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { useLayout } from '~/framework/hooks/layout';

import styles from './styles';
import { BaseButtonProps } from './types';

export const BaseButton = React.memo(
  React.forwardRef(function BaseButton(
    {
      activeStyle,
      contentColor,
      contentColorActive,
      disabled,
      icon,
      iconLeft,
      iconRight,
      loading,
      PressableComponent = Pressable,
      style: _style,
      text,
      TextComponent = Text,
      textStyle: _textStyle,
      ...pressableProps
    }: BaseButtonProps,
    ref: React.Ref<View>,
  ) {
    const { fontScale } = useWindowDimensions();
    const wrapperRef = React.useRef<View>(null);

    const iconSize = UI_SIZES.elements.icon.small;
    const isRound = !text && !iconLeft && !iconRight;

    const children = React.useCallback<Function & PressableProps['children']>(
      ({ pressed }) => {
        const color = pressed && contentColorActive ? contentColorActive : contentColor;
        return loading ? (
          <ActivityIndicator size={iconSize * fontScale} color={color} />
        ) : (
          <>
            {icon && <Svg name={icon} fill={color} width={iconSize} height={iconSize} />}
            {iconLeft && <Svg name={iconLeft} fill={color} width={iconSize} height={iconSize} />}
            {text && <TextComponent style={[_textStyle, { color }]}>{text}</TextComponent>}
            {iconRight && <Svg name={iconRight} fill={color} width={iconSize} height={iconSize} />}
          </>
        );
      },
      [contentColorActive, contentColor, loading, iconSize, fontScale, icon, iconLeft, text, TextComponent, _textStyle, iconRight],
    );

    const measures = useLayout(wrapperRef, [icon, iconLeft, iconRight, loading, text, fontScale]);

    const style = React.useCallback<Function & PressableProps['style']>(
      ({ pressed }) => [
        styles.base,
        _style,
        isRound && styles.baseRound,
        pressed && activeStyle,
        { minHeight: loading ? measures?.height : undefined, minWidth: loading ? measures?.width : undefined },
      ],
      [_style, isRound, activeStyle, loading, measures?.height, measures?.width],
    );

    return (
      <View ref={wrapperRef} style={styles.wrapper}>
        <PressableComponent ref={ref} disabled={disabled || loading} style={style} {...pressableProps}>
          {children}
        </PressableComponent>
      </View>
    );
  }),
);

export const BasePillButton = React.memo(function BasePillButton({ style, ...props }: BaseButtonProps) {
  const ref = React.useRef<View>(null);
  const layout = useLayout(ref);

  return (
    <BaseButton
      ref={ref}
      textStyle={styles.basePillText}
      style={
        React.useMemo(
          () => [styles.basePill, { borderRadius: layout?.height ? layout?.height / 2 : undefined }, style],
          [style, layout?.height],
        ) as ViewProps['style']
      }
      {...props}
    />
  );
});

export const BaseRectButton = React.memo(function BaseRectButton({ style, ...props }: BaseButtonProps) {
  return (
    <BaseButton
      textStyle={styles.baseRectText}
      style={React.useMemo(() => [styles.baseRect, style], [style]) as ViewProps['style']}
      {...props}
    />
  );
});
