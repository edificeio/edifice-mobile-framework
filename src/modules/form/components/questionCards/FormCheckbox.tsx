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
    width: 25,
    height: 25,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: checked ? (disabled ? theme.palette.grey.grey : theme.palette.primary.regular) : theme.ui.text.inverse,
    borderColor: disabled ? theme.palette.grey.grey : theme.ui.text.light,
    borderWidth: checked ? 0 : 2,
  };

  return (
    <View style={style}>
      <Icon size={15} name="checked" color={theme.ui.text.inverse} />
    </View>
  );
};
