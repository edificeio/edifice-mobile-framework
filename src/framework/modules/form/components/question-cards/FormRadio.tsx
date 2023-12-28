import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';

const styles = StyleSheet.create({
  container: {
    width: 25,
    height: 25,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  innerContainer: {
    width: 15,
    height: 15,
    borderRadius: 14,
  },
});

interface IFormRadioProps {
  active: boolean;
  disabled: boolean;
}

export const FormRadio = ({ active, disabled }: IFormRadioProps) => {
  const color = disabled ? theme.palette.grey.grey : theme.palette.primary.regular;
  return (
    <View style={[styles.container, { borderColor: color }]}>
      {active ? <View style={[styles.innerContainer, { backgroundColor: color }]} /> : null}
    </View>
  );
};
