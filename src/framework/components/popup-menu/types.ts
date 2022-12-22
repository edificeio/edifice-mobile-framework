export interface PopupMenuAction {
  id: string;
  title: string;
  action: () => void;
  iconIos?: string;
  iconAndroid?: string;
  destructive?: boolean;
  type?: string;
}

export interface PopupMenuProps {
  actions: PopupMenuAction[];
  children: React.ReactNode;
}
