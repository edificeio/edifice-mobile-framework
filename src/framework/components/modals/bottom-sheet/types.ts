import type { BottomSheetModalProps, BottomSheetProps } from '@gorhom/bottom-sheet';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

export type CustomBottomSheetModalProps = Omit<BottomSheetModalProps, 'snapPoints'> &
  Pick<ViewProps, 'style'> & { additionalTopInset?: number | null | undefined };

export type CustomNonModalBottomSheetProps = Omit<BottomSheetProps, 'snapPoints'> &
  Pick<ViewProps, 'style'> & { additionalTopInset?: number | null | undefined };
