/**
 * Display a label in a chip-shape.
 */
import styled from '@emotion/native';
import * as React from 'react';
import { ColorValue, TextProps, TextStyle, View, ViewProps } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { Icon } from './icon';
import { SmallBoldText, TextSizeStyle } from './text';

// PROPS ==========================================================================================

export interface ILabelProps extends React.PropsWithChildren<{}>, ViewProps {
  text?: string;
  icon?: string;
  iconStyle?: TextStyle;
  color?: ColorValue;
  labelStyle?: 'plain' | 'outline';
  labelSize?: 'normal' | 'large';
  textProps?: TextProps;
}

// STYLE ==========================================================================================

export const LabelView = styled.View({
  alignSelf: 'baseline',
  justifyContent: 'center',
});

// COMPONENT ======================================================================================

export default (props: ILabelProps) => {
  const {
    text,
    icon,
    iconStyle,
    color = theme.ui.text.regular,
    labelStyle = 'plain',
    labelSize = 'normal',
    children,
    textProps,
    ...viewProps
  } = props;
  const LabelViewWithPadding = styled(LabelView)({
    height: labelSize === 'large' ? UI_SIZES.dimensions.height.huge : UI_SIZES.dimensions.height.largerPlus,
    paddingHorizontal: labelSize === 'large' ? UI_SIZES.spacing.medium : UI_SIZES.spacing.small,
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
  const LabelTextWithColor = styled(SmallBoldText)({
    ...(labelStyle === 'plain'
      ? {
          color: theme.ui.text.inverse,
        }
      : {
          color,
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
                color={labelStyle === 'plain' ? theme.ui.text.inverse : color}
                size={TextSizeStyle.Normal.fontSize}
                style={{
                  marginRight: labelSize === 'large' ? UI_SIZES.spacing.minor : undefined,
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
