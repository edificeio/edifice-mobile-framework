import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import { SelectButtonProps } from './types';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { BodyText } from '~/framework/components/text';

const SelectButton: React.FC<SelectButtonProps> = props => {
  const { action, wrapperStyle } = props;

  return (
    <TouchableOpacity onPress={action} {...(props.testID && { testID: props.testID })}>
      <DefaultButton {...props} style={wrapperStyle} TextComponent={BodyText} contentColor={theme.palette.grey.black} />
    </TouchableOpacity>
  );
};

export default SelectButton;
