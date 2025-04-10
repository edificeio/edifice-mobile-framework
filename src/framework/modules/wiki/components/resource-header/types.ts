import { ImageProps } from 'react-native';

export interface ResourceHeaderProps {
  image?: ImageProps | undefined;
  description?: string;
  canAddDescription: boolean;
}
