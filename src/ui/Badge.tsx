import styled from '@emotion/native';
import * as React from 'react';
import { ColorValue } from 'react-native';



import { CommonStyles } from '~/styles/common/styles';



import { Weight } from './Typography';
import { Icon } from './icons/Icon';


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
    marginBottom: 1,
    marginRight: 4,
  },
  (props: Pick<BadgeProps, 'color'>) => ({
    backgroundColor: props.color || CommonStyles.secondary,
  }),
);

const ViewEmpty = styled.View({
  height: 16,
  marginBottom: 7,
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
        <Icon size={10} color="#ffffff" name={content} />
      ) : (
        <ViewEmpty />
      )}
    </ViewBadge>
  );
};