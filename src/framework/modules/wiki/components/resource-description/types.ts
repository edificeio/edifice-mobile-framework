export interface ExpandButtonProps {
  isExpanded: boolean;
  onButtonLayout: (height: number) => void;
}

export interface ResourceDescriptionProps {
  content?: string;
  numberOfLines?: number;
  expanded?: boolean;
  onToggleVisibility?: (expanded: boolean) => void;
  textWidth: number;
}
