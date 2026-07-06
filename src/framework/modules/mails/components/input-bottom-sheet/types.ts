import { FlatListProps } from 'react-native';

export interface MailsInputBottomSheetProps extends Pick<FlatListProps<any>, 'style' | 'contentContainerStyle'> {
  title: string;
  inputLabel: string;
  inputPlaceholder: string;
  initialInputValue?: string;
  disabledAction?: boolean;
  onError?: boolean;
  onSend: (value: string) => void;
}
