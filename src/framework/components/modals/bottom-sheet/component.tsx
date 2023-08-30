import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import * as React from 'react';

import type { CustomBottomSheetModalProps } from './types';

export const CustomBottomSheetModal = React.forwardRef<BottomSheetModalMethods, CustomBottomSheetModalProps>(
  (props: CustomBottomSheetModalProps, ref) => {
    const initialSnapPoints = React.useMemo(() => ['CONTENT_HEIGHT'], []);
    const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
      useBottomSheetDynamicSnapPoints(initialSnapPoints);

    const renderBackdrop = (backdropProps: BottomSheetBackdropProps) => {
      return <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} appearsOnIndex={0} />;
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        backdropComponent={renderBackdrop}
        {...props}>
        <BottomSheetView onLayout={handleContentLayout}>{props.children}</BottomSheetView>
      </BottomSheetModal>
    );
  },
);
