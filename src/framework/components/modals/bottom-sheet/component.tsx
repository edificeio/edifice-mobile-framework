import * as React from 'react';

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useHeaderHeight } from '@react-navigation/elements';

import { UI_SIZES } from '~/framework/components/constants';

export const CustomBottomSheetModal = React.forwardRef<BottomSheetModalMethods, BottomSheetModalProps>(
  (props: BottomSheetModalProps, ref) => {
    const renderBackdrop = (backdropProps: BottomSheetBackdropProps) => {
      return <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} appearsOnIndex={0} />;
    };
    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        enableDynamicSizing
        maxDynamicContentSize={UI_SIZES.getViewHeight({ withoutTabbar: false })}
        backdropComponent={renderBackdrop}
        topInset={useHeaderHeight() + (props.additionalTopInset ?? 0)}
        {...props}>
        <BottomSheetView>{props.children}</BottomSheetView>
      </BottomSheetModal>
    );
  },
);
