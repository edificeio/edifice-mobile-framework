/**
 * Display a label in a chip-shape.
 */

import styled from '@emotion/native';
import * as React from 'react';
import { ColorValue, TextProps, ViewProps } from 'react-native';
import theme from '~/app/theme';
import { Icon } from './icon';
import { rem, TextBold, TextSizeStyle } from './text';

// PROPS ==========================================================================================

export interface ILabelProps extends React.PropsWithChildren<{}>, ViewProps {
  text?: string;
  icon?: string;
  color?: ColorValue;
  labelStyle?: 'plain' | 'outline';
  marginWidth?: 'normal' | 'small';
  textProps?: TextProps;
}

// STYLE ==========================================================================================

export const LabelView = styled.View({
  alignSelf: 'baseline',
  borderWidth: 1,
  borderRadius: 21,
  paddingVertical: 6,
  paddingHorizontal: 12,
});
export const LabelText = styled(TextBold)({
  ...TextSizeStyle.Small
});

// COMPONENT ======================================================================================

export default (props: ILabelProps) => {
  const {
    text,
    icon,
    color = theme.color.text.regular,
    labelStyle = 'plain',
    marginWidth = 'normal',
    children,
    textProps,
    ...viewProps
  } = props;
  const LabelViewWithPadding = styled(LabelView)({
    paddingVertical: marginWidth === 'normal' ? 6 : 2,
    paddingHorizontal: marginWidth === 'normal' ? 12 : 8,
  });
  const LabelViewWithColor = styled(LabelViewWithPadding)({
    ...(labelStyle === 'plain'
      ? {
          backgroundColor: color,
          borderColor: color,
        }
      : {
          borderColor: color,
        }),
  });
  const LabelTextWithColor = styled(LabelText)({
    ...(labelStyle === 'plain'
      ? {
          color: theme.color.text.inverse,
        }
      : {
          color,
        }),
  });
  return (
    <LabelViewWithColor {...viewProps}>
      <LabelTextWithColor {...textProps}>
        <Icon name={icon} color={labelStyle === 'plain' ? theme.color.text.inverse : color} size={rem(10/14)} />
        &nbsp;
        {text}
        {children}
      </LabelTextWithColor>
    </LabelViewWithColor>
  );
};
