import * as React from 'react';

import { ActionButton, ActionButtonProps } from './ActionButton';
import { BottomSheet, BottomSheetProps } from './BottomSheet';

export const BottomButtonSheet = ({
  text,
  iconName,
  url,
  action,
  disabled,
  displayShadow,
}: ActionButtonProps & Omit<BottomSheetProps, 'content'>) => {
  return (
    <BottomSheet
      displayShadow={displayShadow}
      content={<ActionButton text={text} iconName={iconName} url={url} action={action} disabled={disabled} />}
    />
  );
};
