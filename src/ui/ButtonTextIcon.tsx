import style from 'glamorous-native';
import * as React from 'react';
import { CommonStyles } from '../styles/common/styles';
import TouchableOpacity from './CustomTouchableOpacity';
import { Icon } from './icons/Icon';
import { TouchableOpacityProps, View } from 'react-native';

export interface ButtonTextIconProps {
  onPress: () => any;
  disabled?: boolean;
  leftName?: string;
  rightName?: string;
  title: string;
  whiteSpace?: string;
  style?: TouchableOpacityProps;
}

const ButtonText = style.text({
  backgroundColor: 'transparent',
  color: CommonStyles.actionColor,
  fontWeight: '400',
  marginHorizontal: 15,
  textAlign: 'center',
  textAlignVertical: 'center',
});

const ButtonContainer = style(TouchableOpacity)({
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
