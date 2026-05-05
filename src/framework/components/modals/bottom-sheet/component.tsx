import * as React from 'react';
import { Platform, StatusBar, TouchableOpacity, View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useHeaderHeight } from '@react-navigation/elements';
import DeviceInfo from 'react-native-device-info';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { useSyncRef } from '~/framework/hooks/ref';

import styles from './styles';

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

const ANDROID_9_API = 28;

export const CustomBottomSheetModal = React.forwardRef<BottomSheetModalMethods, CustomBottomSheetModalProps>(
  (
    { additionalTopInset = 0, children: Content, closeButton, gutters = true, header: _header, includeSafeArea = true, ...props },
    ref,
  ) => {
    const { bottom } = useSafeAreaInsets();
    const viewStyle = React.useMemo(
      () => [
        gutters ? { paddingHorizontal: UI_SIZES.spacing.big } : undefined,
        // Android 9 and below have issue where tabBar overlays bottomsheet
        Platform.OS === 'android' && DeviceInfo.getApiLevelSync() <= ANDROID_9_API
          ? { paddingBottom: UI_SIZES.elements.tabbarHeight }
          : undefined,
        includeSafeArea ? { paddingBottom: bottom } : undefined,
      ],
      [bottom, gutters, includeSafeArea],
    );

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
              <Content data={data} />
            </View>
          </BottomSheetView>
        )
      ) : (
        <BottomSheetView>
          {header}
          <View style={viewStyle}>{Content}</View>
        </BottomSheetView>
      );

    return (
      <BottomSheetModal
        ref={syncRef}
        index={0}
        enableDynamicSizing
        maxDynamicContentSize={
          UI_SIZES.screen.height -
          (Platform.select({ android: (StatusBar.currentHeight ?? 0) + UI_SIZES.elements.navbarHeight, ios: useHeaderHeight() }) ??
            0)
        }
        backdropComponent={BackdropComponent}
        topInset={useHeaderHeight() + additionalTopInset}
        {...props}>
        {children}
      </BottomSheetModal>
    );
  },
);
