export interface ExpandButtonProps {
  isExpanded: boolean;
}

export interface ResourceDescriptionProps {
  content?: string;
  numberOfLines?: number;
  expanded?: boolean;
  onPress?: (expanded: boolean) => void;
}
