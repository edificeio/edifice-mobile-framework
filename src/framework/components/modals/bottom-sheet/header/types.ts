export interface HeaderBottomSheetModalProps {
  title: string;
  iconLeft?: string;
  iconLeftDisabled?: boolean;
  iconRight?: string;
  iconRightDisabled?: boolean;
  onPressRight?: () => void;
  onPressLeft?: () => void;
}
