import styled from '@emotion/native';
import * as React from 'react';
import { TextStyle, TouchableOpacityProps } from 'react-native';



import theme from '~/app/theme';



import TouchableOpacity from './CustomTouchableOpacity';
import { Icon } from './icons/Icon';


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

const ButtonText = styled.Text({
  backgroundColor: 'transparent',
  color: theme.color.secondary.regular,
  fontWeight: '400',
  marginHorizontal: 15,
  textAlign: 'center',
  textAlignVertical: 'center',
});

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
      <ButtonText style={textStyle}>
        {leftName.length > 0 && <Icon name={leftName} />}
        {whiteSpace}
        {title}
        {whiteSpace}
        {rightName.length > 0 && <Icon name={rightName} />}
      </ButtonText>
    </ButtonContainer>
  );
};