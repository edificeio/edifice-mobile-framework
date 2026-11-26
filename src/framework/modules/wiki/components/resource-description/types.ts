export interface ExpandButtonProps {
  isExpanded: boolean;
}

export interface WikiResourceDescriptionProps {
  content?: string;
  numberOfLines?: number;
  expanded?: boolean;
  onPress?: (expanded: boolean) => void;
}
