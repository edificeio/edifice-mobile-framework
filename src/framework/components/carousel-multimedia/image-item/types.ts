import { ImageURISource } from 'react-native';

export interface ImageItemProps {
  source: ImageURISource;
  containerWidth: number;
  containerHeight: number;
  hideNavBar: () => void;
  isNavBarVisible: boolean;
  isShown: boolean;
  setIsImageError: (isError: boolean) => void;
  showNavBar: () => void;
  toggleNavBarVisibility: () => void;
}
