import style from 'glamorous-native';
import * as React from 'react';
import { StyleSheet } from 'react-native';

import FloatingAction from './FloatingButton/FloatingAction';
import { Icon } from './icons/Icon';

import { TextBold } from '~/framework/components/text';
import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';

export interface ButtonTextIconProps {
  onPress: () => any;
  children?: any;
  disabled?: boolean;
  name: string;
  size?: number;
  style?: any;
  whiteSpace?: string;
  color?: string;
  colorText?: string;
}

const Container = style.view(
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  (props: any) => ({
    style: props.style ? props.style : null,
  }),
);

const TouchableOpacity = style.touchableOpacity({
  alignItems: 'center',
  justifyContent: 'center',
  width: layoutSize.LAYOUT_50,
  height: layoutSize.LAYOUT_50,
  borderRadius: layoutSize.LAYOUT_25,
  backgroundColor: CommonStyles.secondary,
});

export const ButtonIconText = ({ style, children, colorText, ...rest }: ButtonTextIconProps) => {
  if (colorText === undefined) colorText = 'black';
  return (
    <Container>
      <ButtonIcon {...rest} style={[styles.button, style]} />
      <TextBold style={{ color: colorText, fontSize: 15 }}>{children}</TextBold>
    </Container>
  );
};

export const ButtonIcon = ({ name, onPress, children, size, style, color }: ButtonTextIconProps) => {
  if (color === undefined) color = 'white';
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Icon color={color} size={size ? size : layoutSize.LAYOUT_25} name={name} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    ...getButtonShadow(),
  },
});

export default FloatingAction;

export function getButtonShadow() {
  return {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
  };
}

export function getMenuShadow() {
  return {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
  };
}
