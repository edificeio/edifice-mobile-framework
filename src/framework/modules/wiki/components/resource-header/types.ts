import { ImageSourcePropType } from 'react-native';

export interface ResourceHeaderProps {
  image?: ImageSourcePropType | undefined;
  description?: string;
  canAddDescription: boolean;
}
