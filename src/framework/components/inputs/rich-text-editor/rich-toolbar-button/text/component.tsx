import * as React from 'react';

import { BodyText } from '~/framework/components/text';

import { RichToolbarButton } from '../component';
import { RichToolbarTextButtonProps } from './types';

export const RichToolbarTextButton = (props: RichToolbarTextButtonProps) => {
  return <RichToolbarButton {...props} content={<BodyText style={props.textStyle ?? {}}>{props.text}</BodyText>} />;
};
