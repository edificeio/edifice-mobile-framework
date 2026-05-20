import * as React from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

import { UI_SIZES } from './constants';
import { Picture, PictureProps, Svg } from './picture';
import { CaptionBoldText } from './text';

import theme from '~/app/theme';

export interface IBadgeProps {
  content: number | string | PictureProps;
  color?: string | ColorValue;
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: UI_SIZES.dimensions.height.large / 2,
    height: UI_SIZES.dimensions.height.large,
    justifyContent: 'center',
    width: UI_SIZES.dimensions.height.large,
  },
  badgePicture: { height: 16, width: 16 },
});

const isNumber = (value: unknown): value is number => typeof value === 'number';

const isString = (value: unknown): value is string => typeof value === 'string';

const isPicture = (value: unknown): value is PictureProps => typeof value === 'object' && value !== null && 'type' in value;

const BadgePicture = (content: IBadgeProps['content']) => {
  if (content == null) return null;

  if (isNumber(content)) {
    return <CaptionBoldText style={{ color: theme.ui.text.inverse }}>{content > 99 ? '99+' : content}</CaptionBoldText>;
  }

  if (isString(content)) {
    return <Svg height={16} width={16} fill={theme.palette.grey.white} name={content} />;
  }

  if (isPicture(content)) {
    if (content.type === 'Icon') {
      return <Picture {...content} size={12} color={theme.ui.text.inverse} />;
    }

    return <Picture {...content} style={[styles.badgePicture, content.style as object]} />;
  }

  return null;
};

export const Badge = ({ color, content }: IBadgeProps) => {
  const picture = React.useMemo(() => BadgePicture(content), [content]);

  return <View style={[styles.badge, { backgroundColor: color ?? theme.ui.text.light }]}>{picture}</View>;
};
