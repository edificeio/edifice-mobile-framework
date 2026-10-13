import * as React from 'react';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';

import { TertiaryButtonProps } from './types';

const TertiaryButton = (props: TertiaryButtonProps) => {
  return <DefaultButton {...props} contentColor={props.contentColor ?? theme.ui.button.content} />;
};

export default TertiaryButton;
