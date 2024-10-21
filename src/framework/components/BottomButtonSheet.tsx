import * as React from 'react';

import { BottomSheet, BottomSheetProps } from './BottomSheet';

import PrimaryButton, { PrimaryButtonProps } from '~/framework/components/buttons/primary';

export const BottomButtonSheet = (props: PrimaryButtonProps & Omit<BottomSheetProps, 'content'>) => {
  return <BottomSheet displayShadow={props.displayShadow} content={<PrimaryButton {...props} />} />;
};
