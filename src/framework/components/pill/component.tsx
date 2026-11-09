import React from 'react';
import { TextProps, View } from 'react-native';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import {
  BodyBoldText,
  BodyItalicText,
  BodyText,
  CaptionBoldText,
  CaptionItalicText,
  CaptionText,
  SmallBoldText,
  SmallItalicText,
  SmallText,
} from '~/framework/components/text';

import styles, { ICON_SIZE_BY_SIZE, stylesBySize } from './styles';
import { PillProps } from './types';

const BoldTextComponents: Record<NonNullable<PillProps['size']>, React.ComponentType<TextProps>> = {
  large: BodyBoldText,
  normal: SmallBoldText,
  small: CaptionBoldText,
};

const ItalicTextComponents: Record<NonNullable<PillProps['size']>, React.ComponentType<TextProps>> = {
  large: BodyItalicText,
  normal: SmallItalicText,
  small: CaptionItalicText,
};

const RegularTextComponents: Record<NonNullable<PillProps['size']>, React.ComponentType<TextProps>> = {
  large: BodyText,
  normal: SmallText,
  small: CaptionText,
};

export function Pill({ bold, color, dot, icon, italic, size = 'small', text, textColor }: Readonly<PillProps>) {
  const TextComponent = italic ? ItalicTextComponents[size] : bold ? BoldTextComponents[size] : RegularTextComponents[size];
  const isRow = !!dot || !!icon;
  const contentColor = textColor ?? theme.ui.text.inverse;
  const textStyle = React.useMemo(() => [isRow ? styles.textRow : styles.text, { color: contentColor }], [isRow, contentColor]);
  const containerStyle = React.useMemo(
    () => [{ backgroundColor: color }, stylesBySize[size], styles.container, isRow ? styles.containerRow : undefined],
    [color, isRow, size],
  );
  const dotStyle = React.useMemo(() => [styles.dot, { backgroundColor: dot }], [dot]);

  return (
    <View style={containerStyle}>
      {icon ? <Svg name={icon} fill={contentColor} width={ICON_SIZE_BY_SIZE[size]} height={ICON_SIZE_BY_SIZE[size]} /> : null}
      <TextComponent numberOfLines={1} style={textStyle}>
        {text}
      </TextComponent>
      {dot ? <View style={dotStyle} /> : null}
    </View>
  );
}
