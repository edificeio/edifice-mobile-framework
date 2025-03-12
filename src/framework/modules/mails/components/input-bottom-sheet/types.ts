export interface MailsInputBottomSheetProps {
  title: string;
  inputLabel: string;
  inputPlaceholder: string;
  initialInputValue?: string;
  disabledAction?: boolean;
  onError?: boolean;
  onSend: (value: string) => void;
}
