/**
 * Display a label in a chip-shape.
 */
import styled from '@emotion/native';
import * as React from 'react';
import { ColorValue, TextProps, TextStyle, View, ViewProps } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { Icon } from './icon';
import { TextBold, TextSizeStyle } from './text';

// PROPS ==========================================================================================

export interface ILabelProps extends React.PropsWithChildren<{}>, ViewProps {
  text?: string;
  icon?: string;
  iconStyle?: TextStyle;
  color?: ColorValue;
  labelStyle?: 'plain' | 'outline';
  labelSize?: 'normal' | 'small' | 'large';
  textProps?: TextProps;
}

// STYLE ==========================================================================================

export const LabelView = styled.View({
  alignSelf: 'baseline',
  borderRadius: UI_SIZES.radius.large,
  paddingVertical: UI_SIZES.spacing.small,
  paddingHorizontal: UI_SIZES.spacing.medium,
});
export const LabelText = styled(TextBold)({
  // No common style except bold
});

// COMPONENT ======================================================================================

export default (props: ILabelProps) => {
  const {
    text,
    icon,
    iconStyle,
    color = theme.color.text.regular,
    labelStyle = 'plain',
    labelSize = 'normal',
    children,
    textProps,
    ...viewProps
  } = props;
  const LabelViewWithPadding = styled(LabelView)({
    paddingVertical:
      labelSize === 'small' ? UI_SIZES.spacing.tiny : labelSize === 'large' ? UI_SIZES.spacing.smallPlus : UI_SIZES.spacing.small,
    paddingHorizontal:
      labelSize === 'small' ? UI_SIZES.spacing.smallPlus : labelSize === 'large' ? UI_SIZES.spacing.large : UI_SIZES.spacing.medium,
    borderRadius: labelSize === 'large' ? UI_SIZES.radius.extraLarge : UI_SIZES.radius.large,
  });
  const LabelViewWithColor = styled(LabelViewWithPadding)({
    ...(labelStyle === 'plain'
      ? {
          backgroundColor: color,
        }
      : {
          borderWidth: labelSize === 'large' ? UI_SIZES.dimensions.width.small : UI_SIZES.dimensions.width.tiny,
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
    ...(labelSize === 'small'
      ? {
          ...TextSizeStyle.Small,
        }
      : {
          ...TextSizeStyle.Normal,
        }),
  });
  return (
    <LabelViewWithColor {...viewProps}>
      <LabelTextWithColor {...textProps}>
        {icon ? (
          <>
            <View>
              <Icon
                name={icon}
                color={labelStyle === 'plain' ? theme.color.text.inverse : color}
                size={labelSize === 'small' ? TextSizeStyle.Small.fontSize : TextSizeStyle.Normal.fontSize}
                style={{
                  marginRight: labelSize === 'large' ? UI_SIZES.spacing.smallPlus : undefined,
                  ...iconStyle,
                }}
              />
            </View>
            &nbsp;
          </>
        ) : null}
        {text}
        {children}
      </LabelTextWithColor>
    </LabelViewWithColor>
  );
};
