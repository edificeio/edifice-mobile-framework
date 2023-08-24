export interface RadioButtonProps {
  isChecked: boolean;
  isDisabled?: boolean;
  label?: string;
  size?: 'default' | 'small';
  onPress: () => any;
}
