import { Structure } from '../../model';

export interface ListItemProps {
  item: Structure;
  onPressItem?: (item: Structure) => void;
  testID?: string;
}
