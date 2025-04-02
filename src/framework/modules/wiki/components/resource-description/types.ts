export interface ExpandButtonProps {
  isExpanded: boolean;
}

export interface ResourceDescriptionProps {
  content?: string;
  numberOfLines?: number;
  expanded?: boolean;
  onToggleVisibility?: (expanded: boolean) => void;
  textWidth: number;
}
