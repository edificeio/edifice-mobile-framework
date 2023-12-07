import * as React from 'react';

import { RichToolbarButton } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-button/component';
import { BodyText } from '~/framework/components/text';

import { RichToolbarTextButtonProps } from './types';

export const RichToolbarTextButton = (props: RichToolbarTextButtonProps) => {
  return <RichToolbarButton {...props} content={<BodyText style={props.textStyle ?? {}}>{props.text}</BodyText>} />;
};
