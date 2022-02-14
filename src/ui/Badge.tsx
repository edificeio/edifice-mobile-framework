import style from 'glamorous-native';
import * as React from 'react';

import { Weight } from './Typography';
import { Icon } from './icons/Icon';

import { CommonStyles } from '~/styles/common/styles';
import { ColorValue } from 'react-native';

export interface BadgeProps {
  content: number | string;
  color?: string | ColorValue;
}

const ViewBadge = style.view(
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

const ViewEmpty = style.view({
  height: 16,
  marginBottom: 7,
});

const Text = style.text({
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
