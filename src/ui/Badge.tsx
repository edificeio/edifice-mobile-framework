import styled from '@emotion/native';
import * as React from 'react';
import { ColorValue } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { CaptionBoldText } from '~/framework/components/text';

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

export const Badge = ({ content, color }: BadgeProps) => {
  if (!content) {
    return <ViewEmpty />;
  }

  return (
    <ViewBadge color={color}>
      {typeof content === 'number' ? (
        <CaptionBoldText style={{ color: theme.ui.text.inverse }}>{content > 99 ? '99+' : content}</CaptionBoldText>
      ) : typeof content === 'string' ? (
        <Icon size={10} color={theme.ui.text.inverse} name={content} />
      ) : (
        <ViewEmpty />
      )}
    </ViewBadge>
  );
};
