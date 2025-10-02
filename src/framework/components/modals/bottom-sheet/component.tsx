import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useHeaderHeight } from '@react-navigation/elements';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles from './styles';
import { Svg } from '../../picture';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { useSyncRef } from '~/framework/hooks/ref';

function BackdropComponent(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />;
}

export interface CustomBottomSheetModalProps extends BottomSheetModalProps {
  additionalTopInset?: number;
  gutters?: boolean;
  includeSafeArea?: boolean;
  closeButton?: boolean;
  header?: React.ReactNode;
}

const EDGES = ['left', 'right', 'bottom'] as const;

export const CustomBottomSheetModal = React.forwardRef<BottomSheetModalMethods, CustomBottomSheetModalProps>(
  (
    { additionalTopInset = 0, children: Content, closeButton, gutters = true, header: _header, includeSafeArea = true, ...props },
    ref,
  ) => {
    const viewStyle = React.useMemo(() => [gutters ? { paddingHorizontal: UI_SIZES.spacing.big } : undefined], [gutters]);

    const AreaWrapper = includeSafeArea ? SafeAreaView : React.Fragment;

    const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
    const syncRef = useSyncRef(ref, bottomSheetRef);

    const onClose = React.useCallback(() => {
      bottomSheetRef.current?.close();
    }, [bottomSheetRef]);

    const header =
      _header ??
      (closeButton && (
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Svg
              name="ui-close"
              height={UI_SIZES.elements.icon.small}
              width={UI_SIZES.elements.icon.small}
              fill={theme.palette.grey.black}
            />
          </TouchableOpacity>
        </View>
      ));

    const children =
      typeof Content === 'function' ? (
        data => (
          <BottomSheetView>
            {header}
            <View style={viewStyle}>
              <AreaWrapper edges={EDGES}>
                <Content data={data} />
              </AreaWrapper>
            </View>
          </BottomSheetView>
        )
      ) : (
        <BottomSheetView>
          {header}
          <View style={viewStyle}>
            <AreaWrapper edges={EDGES}>{Content}</AreaWrapper>
          </View>
        </BottomSheetView>
      );

    return (
      <BottomSheetModal
        ref={syncRef}
        index={0}
        enableDynamicSizing
        maxDynamicContentSize={UI_SIZES.getViewHeight({ withoutTabbar: false })}
        backdropComponent={BackdropComponent}
        topInset={useHeaderHeight() + additionalTopInset}
        {...props}>
        {children}
      </BottomSheetModal>
    );
  },
);
