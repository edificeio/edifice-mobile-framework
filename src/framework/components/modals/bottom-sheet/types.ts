import type { BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

export type CustomBottomSheetModalProps = Omit<BottomSheetModalProps, 'snapPoints'> &
  Pick<ViewProps, 'style'> & { additionalTopInset?: number | null | undefined };
