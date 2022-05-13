import * as React from 'react';

import { ActionButton, ActionButtonProps } from './ActionButton';
import { BottomSheet } from './BottomSheet';

export const BottomButtonSheet = ({ text, iconName, url, action, disabled }: ActionButtonProps) => {
  return <BottomSheet content={<ActionButton text={text} iconName={iconName} url={url} action={action} disabled={disabled} />} />;
};
