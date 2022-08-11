import styled from '@emotion/native';
import * as React from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { TextBold } from '~/framework/components/text';
import { layoutSize } from '~/styles/common/layoutSize';

const styles = StyleSheet.create({
  buttonWithShadow: {
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
  },
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  text: {
    fontSize: 15,
  },
});

const TouchableOpacity = styled.TouchableOpacity({
  alignItems: 'center',
  justifyContent: 'center',
  width: layoutSize.LAYOUT_50,
  height: layoutSize.LAYOUT_50,
  borderRadius: layoutSize.LAYOUT_25,
  backgroundColor: theme.palette.secondary.regular,
});

interface IButtonTextIconProps {
  name: string;
  size?: number;
  style?: any;
  children?: any;
  color?: string | ColorValue;
  colorText?: string;
  onPress: () => any;
}

export const ButtonIcon = ({ name, size, style, color = theme.ui.text.inverse, onPress }: IButtonTextIconProps) => (
  <TouchableOpacity onPress={onPress} style={[styles.buttonWithShadow, style]}>
    <Icon color={color} size={size ? size : layoutSize.LAYOUT_25} name={name} />
  </TouchableOpacity>
);

export const ButtonIconText = ({
  style,
  children,
  colorText = theme.palette.grey.black as string,
  ...rest
}: IButtonTextIconProps) => (
  <View style={styles.mainContainer}>
    <ButtonIcon {...rest} style={[styles.buttonWithShadow, style]} />
    <TextBold style={[styles.text, { color: colorText }]}>{children}</TextBold>
  </View>
);

export function getMenuShadow() {
  return {
    elevation: 5,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
  };
}
