export type ToggleSide = 'left' | 'right';

export type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  side?: ToggleSide;
  testID?: string;
};
