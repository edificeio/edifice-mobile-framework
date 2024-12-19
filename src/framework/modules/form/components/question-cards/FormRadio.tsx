import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    height: 25,
    justifyContent: 'center',
    width: 25,
  },
  innerContainer: {
    borderRadius: 14,
    height: 15,
    width: 15,
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
