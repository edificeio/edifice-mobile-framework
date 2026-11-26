import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { BodyText } from '~/framework/components/text';

import { WikiSelectButtonProps } from './types';

const WikiSelectButton: React.FC<WikiSelectButtonProps> = props => {
  const { action, wrapperStyle } = props;

  return (
    <TouchableOpacity onPress={action} {...(props.testID && { testID: props.testID })}>
      <DefaultButton {...props} style={wrapperStyle} TextComponent={BodyText} contentColor={theme.palette.grey.black} />
    </TouchableOpacity>
  );
};

export default WikiSelectButton;
