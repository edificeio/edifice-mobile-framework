import * as React from 'react';

import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useHeaderHeight } from '@react-navigation/elements';

import styles from './styles';
import type { CustomBottomSheetModalProps } from './types';

export const CustomBottomSheetModal = React.forwardRef<BottomSheetModalMethods, CustomBottomSheetModalProps>(
  ({ style, ...props }: CustomBottomSheetModalProps, ref) => {
    const renderBackdrop = (backdropProps: BottomSheetBackdropProps) => {
      return <BottomSheetBackdrop {...backdropProps} disappearsOnIndex={-1} appearsOnIndex={0} />;
    };

    const newStyle = React.useMemo(() => {
      return style !== undefined ? style : styles.contentContainer;
    }, [style]);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        topInset={useHeaderHeight() + (props.additionalTopInset ?? 0)}
        {...props}>
        <BottomSheetView style={newStyle}>{props.children}</BottomSheetView>
      </BottomSheetModal>
    );
  },
);
