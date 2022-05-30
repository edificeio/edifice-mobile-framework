import styled from '@emotion/native';
import * as React from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { Icon } from './icon';
import { Picture, PictureProps } from './picture';
import { TextBold } from './text';

export interface IBadgeProps {
  content: number | string | PictureProps;
  color?: string | ColorValue;
}

const BadgeText = styled(TextBold)({
  color: theme.ui.text.inverse,
  fontSize: 12,
});

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    height: UI_SIZES.dimensions.height.large,
    width: UI_SIZES.dimensions.height.large,
    borderRadius: UI_SIZES.dimensions.height.large / 2,
  },
  badgePicture: { width: 16, height: 16 },
});

export const Badge = ({ content, color }: IBadgeProps) => {
  const picture = React.useMemo(() => {
    if (!content) {
      return null;
    } else if (typeof content === 'number') {
      return <BadgeText>{content > 99 ? '99+' : content}</BadgeText>;
    } else if (typeof content === 'string') {
      return <Icon size={12} color={theme.ui.text.inverse} name={content} />;
    } else {
      if (content.type === 'Icon') {
        return <Picture {...content} size={12} color={theme.ui.text.inverse} />;
      } else if (content.type === 'NamedSvg') {
        return <Picture fill={theme.ui.text.inverse} {...content} style={[styles.badgePicture, content.style as object]} />;
      } else {
        return <Picture {...content} style={[styles.badgePicture, content.style as object]} />;
      }
    }
  }, [content]);
  if (!content) {
    return null;
  }
  return <View style={[styles.badge, { backgroundColor: color || theme.ui.text.light }]}>{picture}</View>;
};
