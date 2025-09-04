import * as React from 'react';

import { TertiaryButtonProps } from './types';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';

const TertiaryButton = (props: TertiaryButtonProps) => {
  return <DefaultButton {...props} contentColor={props.contentColor ?? theme.palette.primary.regular} />;
};

export default TertiaryButton;
