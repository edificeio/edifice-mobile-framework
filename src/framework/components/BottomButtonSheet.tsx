import * as React from 'react';

import { BottomSheet, BottomSheetProps } from './BottomSheet';
import { ActionButton, ActionButtonProps } from './buttons/action';

export const BottomButtonSheet = ({
  text,
  iconName,
  url,
  action,
  disabled,
  displayShadow,
  loading,
}: ActionButtonProps & Omit<BottomSheetProps, 'content'>) => {
  return (
    <BottomSheet
      displayShadow={displayShadow}
      content={<ActionButton loading={loading} text={text} iconName={iconName} url={url} action={action} disabled={disabled} />}
    />
  );
};
