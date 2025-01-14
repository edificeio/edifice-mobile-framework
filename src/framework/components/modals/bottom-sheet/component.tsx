import * as React from 'react';

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

import styles from './styles';

export const CustomBottomSheetModal = React.forwardRef<BottomSheetModalMethods, BottomSheetModalProps>(
  (props: BottomSheetModalProps, ref) => {
    const renderBackdrop = (backdropProps: BottomSheetBackdropProps) => {
      return <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} appearsOnIndex={0} />;
    };
    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        //snapPoints={animatedSnapPoints}
        //handleHeight={animatedHandleHeight}
        //contentHeight={animatedContentHeight}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        {...props}>
        <BottomSheetView style={[styles.contentContainer, props.containerStyle]}>{props.children}</BottomSheetView>
      </BottomSheetModal>
    );
  },
);
