export interface MailsFolderItemProps {
  icon: string;
  name: string;
  selected: boolean;
  depth?: number;
  onPress: () => void;
}
