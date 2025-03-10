export interface MailsInputBottomSheetProps {
  title: string;
  disabledAction: boolean;
  action: () => void;
  inputLabel: string;
  inputPlaceholder: string;
  inputValue: string;
  setInputValue: (value: string) => void;
  onError?: boolean;
}
