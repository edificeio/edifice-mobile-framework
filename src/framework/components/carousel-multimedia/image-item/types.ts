import { ImageURISource } from 'react-native';

export interface ImageItemProps {
  source: ImageURISource;
  containerWidth: number;
  containerHeight: number;
  hideNavBar: () => void;
  isNavBarVisible: boolean;
  isShown: boolean;
  showNavBar: () => void;
  toggleNavBarVisibility: () => void;
}
