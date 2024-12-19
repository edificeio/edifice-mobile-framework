import React from 'react';
import { View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture';

interface IFormCheckboxProps {
  checked: boolean;
  disabled: boolean;
}

export const FormCheckbox = ({ checked, disabled }: IFormCheckboxProps) => {
  const style: ViewStyle = {
    alignItems: 'center',
    backgroundColor: checked ? (disabled ? theme.palette.grey.grey : theme.palette.primary.regular) : theme.ui.text.inverse,
    borderColor: disabled ? theme.palette.grey.grey : theme.ui.text.light,
    borderRadius: 6,
    borderWidth: checked ? 0 : 2,
    height: 25,
    justifyContent: 'center',
    width: 25,
  };

  return (
    <View style={style}>
      <Icon size={15} name="checked" color={theme.ui.text.inverse} />
    </View>
  );
};
