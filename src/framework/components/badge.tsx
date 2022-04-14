import styled from '@emotion/native';
import * as React from 'react';
import { ColorValue, View } from 'react-native';

import theme from '~/app/theme';

import { Icon } from './icon';
import { TextBold } from './text';

export interface IBadgeProps {
  content: number | string;
  color?: string | ColorValue;
}

const BadgeText = styled(TextBold)({
  color: theme.color.text.inverse,
  fontSize: 12,
});

export const Badge = ({ content, color }: IBadgeProps) => {
  if (!content) {
    return null;
  }
  return (
    <View
      style={{
        alignItems: 'center',
        alignSelf: 'flex-start',
        justifyContent: 'center',
        height: 20,
        width: 20,
        borderRadius: 10,
        backgroundColor: color || theme.color.neutral.regular,
      }}>
      {typeof content === 'number' ? (
        <BadgeText>{content > 99 ? '99+' : content}</BadgeText>
      ) : typeof content === 'string' ? (
        <Icon size={12} color="#ffffff" name={content} />
      ) : null}
    </View>
  );
};
