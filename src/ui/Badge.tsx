import styled from '@emotion/native';
import * as React from 'react';
import { ColorValue } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { CommonStyles } from '~/styles/common/styles';

import { Weight } from './Typography';

export interface BadgeProps {
  content: number | string;
  color?: string | ColorValue;
}

const ViewBadge = styled.View(
  {
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    height: 18,
    width: 18,
    borderRadius: 10,
  },
  (props: Pick<BadgeProps, 'color'>) => ({
    backgroundColor: props.color || theme.palette.secondary.regular,
  }),
);

const ViewEmpty = styled.View({
  height: 16,
  marginBottom: 7, // Magic number here
});

const Text = styled.Text({
  color: 'white',
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 10,
  fontWeight: Weight.SemiBold,
});

export const Badge = ({ content, color }: BadgeProps) => {
  if (!content) {
    return <ViewEmpty />;
  }

  return (
    <ViewBadge color={color}>
      {typeof content === 'number' ? (
        <Text>{content > 99 ? '99+' : content}</Text>
      ) : typeof content === 'string' ? (
        <Icon size={10} color={theme.ui.text.inverse} name={content} />
      ) : (
        <ViewEmpty />
      )}
    </ViewBadge>
  );
};
