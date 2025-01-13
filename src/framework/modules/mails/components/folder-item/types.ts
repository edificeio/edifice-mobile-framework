export interface MailsFolderItemProps {
  icon: string;
  name: string;
  selected: boolean;
  nbUnread?: number;
  depth?: number;
  disabled?: boolean;
  onPress: () => void;
}
