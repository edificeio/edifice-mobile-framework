import styled from '@emotion/native';
import * as React from 'react';
import { TextStyle, TouchableOpacityProps } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallText } from '~/framework/components/text';

import TouchableOpacity from './CustomTouchableOpacity';

export interface ButtonTextIconProps {
  onPress: () => any;
  disabled?: boolean;
  leftName?: string;
  rightName?: string;
  title: string;
  whiteSpace?: string;
  style?: TouchableOpacityProps;
  textStyle?: TextStyle;
}

const ButtonContainer = styled(TouchableOpacity)({
  alignItems: 'center',
  flex: 0,
  flexGrow: 0,
  flexShrink: 0,
  justifyContent: 'center',
});

export const ButtonTextIcon = ({
  onPress,
  disabled = false,
  title,
  leftName = '',
  rightName = '',
  whiteSpace = ' ',
  style,
  textStyle,
}: ButtonTextIconProps) => {
  return (
    <ButtonContainer style={style} onPress={onPress} disabled={disabled}>
      <SmallText
        style={[
          {
            backgroundColor: 'transparent',
            color: theme.palette.primary.regular,
            marginHorizontal: UI_SIZES.spacing.medium,
            textAlign: 'center',
            textAlignVertical: 'center',
          },
          textStyle,
        ]}>
        {leftName.length > 0 && <Icon name={leftName} />}
        {whiteSpace}
        {title}
        {whiteSpace}
        {rightName.length > 0 && <Icon name={rightName} />}
      </SmallText>
    </ButtonContainer>
  );
};
